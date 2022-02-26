import { SlashCommandBuilder } from '@discordjs/builders';
import {
  CommandInteractionOption,
  CommandInteraction,
  Interaction,
  Role,
  CategoryChannel,
  MessageActionRow,
  MessageButton,
  TextChannel,
  Message,
} from 'discord.js';
import { basicRoles, integrations } from '../constants';
import { Channel } from '../types';

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
  interaction: CommandInteraction,
  data: readonly CommandInteractionOption[],
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

export const createProjectRoles = async (
  interaction: Interaction,
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
  interaction: Interaction,
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
  interaction: Interaction,
  channels: Channel[],
) => {
  return await Promise.all(
    channels.map(
      async ({ name, permissionOverwrites, parent }) =>
        await interaction.guild.channels.create(name || 'general', {
          type: 'GUILD_TEXT',
          permissionOverwrites,
          parent,
        }),
    ),
  );
};

const parseChannels = (
  interaction: Interaction,
  roles: Role[],
  category: CategoryChannel,
): Channel[] =>
  roles.slice(0, -1).map(({ name }) => ({
    name,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.cache.find(
          (cacheRole) => cacheRole.name === name,
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
        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      },
    ],
    parent: category,
  }));

const addIntegrationChannels = (
  interaction: Interaction,
  channels: Channel[],
  integrations: string[],
  shortname: string,
): Channel[] =>
  integrations.reduce(
    (previousValue, name) => [
      ...previousValue,
      {
        name: `${shortname}-${name}`,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.cache.find(
              (cacheRole) => cacheRole.name === `${shortname}-general`,
            ),
            allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
          },
        ],
        parent: previousValue[0].parent,
      },
    ],
    channels,
  );

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
  const shortname = roles[0].name.split('-')[0];
  row.addComponents(
    new MessageButton()
      .setCustomId(`${shortname}-remove`)
      .setLabel('Remove me from this project')
      .setStyle('DANGER'),
  );
  await channel.sendTyping();
  const message = await channel.send({
    content: 'Choose your role:',
    components: [row],
  });
  await message.pin();
};

export const handleCreateNewProjectCommand = async (
  interaction: CommandInteraction,
  name: string,
  shortname: string,
  projectName: string,
) => {
  const roles = await createProjectRoles(interaction, shortname);
  const category = await createCategory(interaction, name, shortname);
  const parsedChannels = parseChannels(interaction, roles, category);
  const withIntegrations = addIntegrationChannels(
    interaction,
    parsedChannels,
    integrations,
    shortname,
  );
  const channels = await createChannels(interaction, withIntegrations);
  const generalChannel = channels[0];
  await addRoleChooser(roles, generalChannel);

  const message = (await interaction.editReply({
    content: `You created project with name ${projectName}`,
    components: [joinButton(roles[0].name)],
  })) as Message;
  await message.pin();
};
