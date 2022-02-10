import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('clears roles');

export const clearRoles = async (interaction: CommandInteraction) => {
  const createdRoles = interaction.guild.roles.cache.filter((role) =>
    role.name.includes('DW'),
  );
  await Promise.all(createdRoles.map(async (role) => await role.delete()));
};

export const clearChannels = async (interaction: CommandInteraction) => {
  const createdChannels = interaction.guild.channels.cache.filter((channel) =>
    channel.name.includes('dw'),
  );
  await Promise.all(
    createdChannels.map(async (channel) => await channel.delete()),
  );
};
