import { TextChannel, ThreadChannel } from 'discord.js';

export function seperateThreadID(channel: TextChannel | ThreadChannel) {
  let baseChannel: TextChannel;
  let threadId: string;

  // Seperate thread ID from base channel
  if (channel.isThread()) {
    if (channel.parent.type == 'GUILD_NEWS') throw new Error('INVALID_CHANNEL');
    baseChannel = channel.parent;
    threadId = channel.id;
  } else baseChannel = channel;

  return { baseChannel, threadId };
}
