import { Client, GuildMember, TextChannel } from 'discord.js';

export const newMemberHandler = async (client: Client, member: GuildMember) => {
  const joinedChannel = client.channels.cache.find(
    (channel) => channel.type === 'GUILD_TEXT' && channel.name === 'ogólny',
  ) as TextChannel;
  console.log(joinedChannel.id);

  await joinedChannel.send({
    content: `Hej <@${member.id}>! Prosiłbym o ustawienie sobie imienia i nazwiska jako nick na tym serwerze.`,
  });
};
