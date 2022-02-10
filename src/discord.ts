import {
  ButtonInteraction,
  Client,
  GuildMember,
  Message,
  MessageButton,
  Role,
  TextChannel,
} from 'discord.js';
import {
  checkProjectName,
  handleCreateNewProject,
  joinButton,
} from './commands/newProject';
import { clearChannels, clearRoles } from './commands/clear';

const handleButtonClick = (interaction: ButtonInteraction) => {
  const { member, component, guild } = interaction;
  const guildMember = member as GuildMember;
  const button = component as MessageButton;
  let role: Role;
  let isRemove = false;
  if (button.customId.includes('remove')) {
    isRemove = true;
    const shortname = button.customId.split('-')[0];
    const roles = guild.roles.cache.find((role) =>
      role.name.includes(shortname),
    );
    guildMember.roles.remove(roles);
    role = {
      name: shortname,
    } as Role;
  } else {
    if (button.customId.includes('join')) {
      const roleName = button.customId.split('-').slice(1, 10).join('-');
      role = guild.roles.cache.find((role) => role.name === roleName);
    } else {
      const roleName = button.label;
      role = guild.roles.cache.find((role) => role.name === roleName);
    }
    guildMember.roles.add(role);
  }

  return { guildMember, role, isRemove };
};

export default (client: Client) => {
  client.once('ready', () => {
    console.log('Ready!');
  });

  client.on('guildMemberAdd', async (member: GuildMember) => {
    const joinedChannel = client.channels.cache.find(
      (channel) => channel.type === 'GUILD_TEXT' && channel.name === 'ogólny',
    ) as TextChannel;
    console.log(joinedChannel.id);

    await joinedChannel.send({
      content: `Hej <@${member.id}>! Prosiłbym o ustawienie sobie imienia i nazwiska jako nick na tym serwerze.`,
    });
  });

  client.on('guildCreate', async (guild) => {
    const isThereProjectsChannel = guild.channels.cache.some(
      (channel) =>
        channel.name === 'project-manager' && channel.type === 'GUILD_TEXT',
    );
    if (isThereProjectsChannel) return;

    const isThereprojectManagerRole = guild.roles.cache.some(
      (role) => role.name === 'project-manager',
    );
    if (!isThereprojectManagerRole) {
      await guild.roles.create({ name: 'project-manager', color: 'NAVY' });
    }
    const projectManagerRole = guild.roles.cache.find(
      (role) => role.name === 'project-manager',
    );

    await guild.channels.create('project-manager', {
      type: 'GUILD_TEXT',
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: ['VIEW_CHANNEL'],
          deny: ['SEND_MESSAGES'],
        },
        {
          id: projectManagerRole.id,
          allow: ['SEND_MESSAGES'],
        },
      ],
    });
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.deferReply();

    const { guildMember, role, isRemove } = handleButtonClick(interaction);

    let action = 'is now part of';
    if (isRemove) action = 'left';

    await interaction.editReply(
      `${guildMember.displayName} ${action} ${role.name} team!`,
    );
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const projectsChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.name === 'project-manager' && channel.type === 'GUILD_TEXT',
    );
    if (interaction.channelId !== projectsChannel.id) {
      interaction.reply('Wrong channel');
      interaction.deleteReply();
      return;
    }

    const { commandName, options } = interaction;
    const { data } = options;

    if (commandName === 'new-project') {
      try {
        await interaction.deferReply();

        const { projectName, name, shortname } = await checkProjectName(
          interaction,
          data,
        );

        const { roles } = await handleCreateNewProject(
          interaction,
          name,
          shortname,
        );

        const message = (await interaction.editReply({
          content: `You created project with name ${projectName}`,
          components: [joinButton(roles[0].name)],
        })) as Message;
        await message.pin();
      } catch (err) {
        console.log(err);
      }
    } else if (commandName === 'clear') {
      try {
        await clearRoles(interaction);
        await clearChannels(interaction);
      } catch (err) {
        console.log(err);
      }

      await interaction.reply('Done');
    } else {
      await interaction.reply('Use proper command.');
    }
  });
};
