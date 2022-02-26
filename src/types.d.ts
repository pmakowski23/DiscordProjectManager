import { CategoryChannel, OverwriteResolvable } from 'discord.js';

export interface Channel {
  name: string;
  permissionOverwrites: OverwriteResolvable[];
  parent: CategoryChannel;
}
