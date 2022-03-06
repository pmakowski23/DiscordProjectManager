import { CommandInteraction } from 'discord.js';
import { handleClearCommand } from '../commands/clear';
import { handleAddGithubCommand } from '../commands/github';
import {
  checkProjectName,
  handleCreateNewProjectCommand,
} from '../commands/newProject';

export const commandsHandler = async (interaction: CommandInteraction) => {
  if (!isProperChannel(interaction)) return;

  const { commandName, options } = interaction;
  const { data } = options;

  await interaction.reply('Working on it...');

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
  } else if (commandName === 'add-github') {
    handleAddGithubCommand(interaction);
  } else if (commandName === 'clear') {
    handleClearCommand(interaction);
  } else {
    await interaction.editReply('Use proper command.');
  }
};

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
