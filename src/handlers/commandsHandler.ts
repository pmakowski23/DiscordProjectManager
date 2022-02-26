import { CommandInteraction } from 'discord.js';
import { handleClearCommand } from '../commands/clear';
import {
  checkProjectName,
  handleCreateNewProjectCommand,
} from '../commands/newProject';

const isProperChannel = (interaction: CommandInteraction) => {
  const projectsChannel = interaction.guild.channels.cache.find(
    (channel) =>
      channel.name === 'project-manager' && channel.type === 'GUILD_TEXT',
  );

  if (interaction.channelId !== projectsChannel.id) {
    interaction.reply('Wrong channel');
    interaction.deleteReply();
    return false;
  }

  return true;
};

export const commandsHandler = async (interaction: CommandInteraction) => {
  await interaction.deferReply();
  if (isProperChannel(interaction)) return;

  const { commandName, options } = interaction;
  const { data } = options;

  if (commandName === 'new-project') {
    const { projectName, name, shortname } = await checkProjectName(
      interaction,
      data,
    );

    await handleCreateNewProjectCommand(
      interaction,
      name,
      shortname,
      projectName,
    );
  } else if (commandName === 'clear') {
    handleClearCommand(interaction);
  } else {
    await interaction.reply('Use proper command.');
  }
};
