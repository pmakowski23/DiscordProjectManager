import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('add-github')
  .setDescription('Adds github integration to your project')

export const handleAddGithubCommand = async (
  interaction: CommandInteraction,
) => {
  const message = (await interaction.editReply(
    'Successfuly added github webhooks to your project.',
  )) as Message;
  await message.pin();
};
