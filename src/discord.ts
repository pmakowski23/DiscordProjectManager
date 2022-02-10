import { Client, GuildMember } from 'discord.js';
import {
  buttonInteractionHandler,
  newGuildHandler,
  newMemberHandler,
  commandsHandler,
} from './handlers';

export default (client: Client) => {
  client.once('ready', () => {
    console.log('Ready!');
  });

  client.on('guildMemberAdd', async (member: GuildMember) => {
    newMemberHandler(client, member);
  });

  client.on('guildCreate', async (guild) => {
    newGuildHandler(guild);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    buttonInteractionHandler(interaction);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    commandsHandler(interaction);
  });
};
