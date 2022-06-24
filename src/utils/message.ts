import { Message, TextChannel, ThreadChannel } from 'discord.js';
import { sendGetCreateWebhook, messageToWebhookOptions } from './';
import filterMapP from '../filters/index.js';
import { isTextChannel, isThreadChannel } from '@sapphire/discord.js-utilities';

export async function copyMessage(
  message: Message,
  channel: TextChannel | ThreadChannel
) {
  const convertedMessage = messageToWebhookOptions(message);
  const sentMessage = await sendGetCreateWebhook(channel, convertedMessage);
  return sentMessage;
}

export async function moveMessage(
  message: Message,
  channel: TextChannel | ThreadChannel
) {
  const victimChannel = message.channel;
  if (victimChannel.type != 'GUILD_TEXT') throw new Error('INVALID_CHANNEL');

  const victimMe = message.guild.me;
  if (!victimChannel.permissionsFor(victimMe).has('MANAGE_MESSAGES'))
    throw new Error('INVALID_PERMISSIONS');

  const sentMessage = await copyMessage(message, channel);
  await message.delete();
  return sentMessage;
}

export async function filterMessage(message: Message, filters: string[]) {
  const filterMap = await filterMapP;

  const channel = message.channel;
  if (!isThreadChannel(channel) && !isTextChannel(channel))
    throw new Error('CHANNEL_TYPE');

  const me = message.guild.me;
  if (!channel.permissionsFor(me).has('MANAGE_MESSAGES'))
    throw new Error('PERMISSIONS');

  for (let i = 0; i < filters.length; i++) {
    const filterName = filters[i];
    if (!filterMap.has(filterName)) throw new Error('FILTER');
  }

  let convertedMessage = messageToWebhookOptions(message);
  for (let i = 0; i < filters.length; i++) {
    const filterName = filters[i];
    convertedMessage = await filterMap.get(filterName).filter(convertedMessage);
  }

  const sentMessage = sendGetCreateWebhook(channel, convertedMessage);
  await message.delete();
  return sentMessage;
}
