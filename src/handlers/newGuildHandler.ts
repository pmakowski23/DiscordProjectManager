import { Guild } from 'discord.js';

export const newGuildHandler = async (guild: Guild) => {
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
};
