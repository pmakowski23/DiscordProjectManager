import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteractionOption,
  CacheType,
  CommandInteraction,
  Interaction,
  Role,
  CategoryChannel,
  MessageActionRow,
  MessageButton,
  TextChannel,
  RoleData,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('new-project')
  .setDescription('Creates category and channels for new project')
  .addStringOption((option) =>
    option
      .setName('shortname')
      .setDescription('The shortname of the project')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('The name of the project')
      .setRequired(true),
  );

export const checkProjectName = async (
  interaction: CommandInteraction<CacheType>,
  data: readonly CommandInteractionOption<CacheType>[],
) => {
  const [shortnameObj, nameObj] = data;
  const shortname = shortnameObj.value;
  const name = nameObj.value;
  if (typeof shortname !== 'string' || typeof name !== 'string') {
    await interaction.reply('Provide proper name.');
    throw new Error();
  }
  if (!/[A-Z]{2}/.test(shortname) || shortname.length !== 2) {
    await interaction.reply('Shortname must be 2 uppercase letters.');
    throw new Error();
  }
  return {
    projectName: `${shortname}-${name}`,
    name,
    shortname,
  };
};

const basicRoles: RoleData[] = [
  {},
  { name: 'Frontend', color: 'GREEN' },
  { name: 'Backend', color: 'ORANGE' },
  { name: 'DevOps', color: 'BLUE' },
  { name: 'Product-owner', color: 'NAVY' },
];

export const createProjectRoles = async (
  interaction: Interaction<CacheType>,
  projectShortname: string,
): Promise<Role[]> => {
  return await Promise.all(
    basicRoles.map(async (role) => {
      const { name, ...rest } = role;
      if (!name) {
        return await interaction.guild.roles.create({
          name: `${projectShortname}-general`,
          ...rest,
        });
      }
      const roleName = `${projectShortname}-${name}`;
      return await interaction.guild.roles.create({
        name: roleName,
        ...rest,
      });
    }),
  );
};

export const createCategory = async (
  interaction: Interaction<CacheType>,
  categoryName: string,
  projectShortname: string,
) => {
  return await interaction.guild.channels.create(categoryName, {
    type: 'GUILD_CATEGORY',
    permissionOverwrites: [
      {
        id: interaction.guild.roles.cache.find((role) =>
          role.name.includes(projectShortname),
        ),
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
      },
      {
        id: interaction.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
    ],
  });
};

export const createChannels = async (
  interaction: Interaction<CacheType>,
  category: CategoryChannel,
  roles: Role[],
) => {
  return await Promise.all(
    roles.slice(0, -1).map(
      async (role) =>
        await interaction.guild.channels.create(role.name || 'general', {
          type: 'GUILD_TEXT',
          permissionOverwrites: [
            {
              id: interaction.guild.roles.cache.find(
                (cacheRole) => cacheRole.name === role.name,
              ),
              allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
            {
              id: interaction.guild.roles.cache.find((cacheRole) =>
                cacheRole.name.includes('Product-owner'),
              ),
              allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            },
            {
              id: interaction.guild.roles.everyone,
              deny: ['VIEW_CHANNEL'],
            },
          ],
          parent: category,
        }),
    ),
  );
};

export const joinButton = (customId: string) =>
  new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(`join-${customId}`)
      .setLabel('Participate!')
      .setStyle('PRIMARY'),
  );

export const addRoleChooser = async (roles: Role[], channel: TextChannel) => {
  const buttons = roles.slice(1, 4);
  const row = buttons.reduce((acc, role) => {
    return acc.addComponents(
      new MessageButton()
        .setCustomId(role.name)
        .setLabel(role.name)
        .setStyle('PRIMARY'),
    );
  }, new MessageActionRow());
  await channel.sendTyping();
  const message = await channel.send({
    content: 'Choose your role:',
    components: [row],
  });
  await message.pin();
};

export const handleCreateNewProject = async (
  interaction: CommandInteraction<CacheType>,
  name: string,
  shortname: string,
) => {
  const roles = await createProjectRoles(interaction, shortname);
  const category = await createCategory(interaction, name, shortname);
  const channels = await createChannels(interaction, category, roles);
  const generalChannel = channels[0];
  await addRoleChooser(roles, generalChannel);

  return { roles };
};
