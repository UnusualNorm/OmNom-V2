import { Message, TextChannel, ThreadChannel } from 'discord.js';
import { sendGetCreateWebhook, messageToWebhookOptions } from './';
import filterMap from '../filters';
import { isTextChannel, isThreadChannel } from '@sapphire/discord.js-utilities';

export async function copyMessage(
  message: Message,
  channel: TextChannel | ThreadChannel
) {
  // Convert and send message
  const convertedMessage = messageToWebhookOptions(message);
  const sentMessage = await sendGetCreateWebhook(channel, convertedMessage);
  return sentMessage;
}

export async function moveMessage(
  message: Message,
  channel: TextChannel | ThreadChannel
) {
  const victimChannel = message.channel;

  // Make sure we are in a guild
  if (victimChannel.type != 'GUILD_TEXT') throw new Error('INVALID_CHANNEL');

  // Make sure we have permissions
  const victimMe = message.guild.me;
  if (!victimChannel.permissionsFor(victimMe).has('MANAGE_MESSAGES'))
    throw new Error('INVALID_PERMISSIONS');

  // Copy the message, then delete it
  const sentMessage = await copyMessage(message, channel);
  await message.delete();
  return sentMessage;
}

export async function filterMessage(message: Message, filters: string[]) {
  // Make sure we have the correct channel type
  const channel = message.channel;
  if (!isThreadChannel(channel) && !isTextChannel(channel))
    throw new Error('CHANNEL_TYPE');

  // Make sure we have permissions
  const me = message.guild.me;
  if (!channel.permissionsFor(me).has('MANAGE_MESSAGES'))
    throw new Error('PERMISSIONS');

  // Make sure we have valid filters
  for (let i = 0; i < filters.length; i++) {
    const filterName = filters[i];
    if (!filterMap.has(filterName)) throw new Error('FILTER');
  }

  // Apply filters
  let convertedMessage = messageToWebhookOptions(message);
  for (let i = 0; i < filters.length; i++) {
    const filterName = filters[i];
    convertedMessage = await filterMap.get(filterName).filter(convertedMessage);
  }

  // Send webhook message and delete
  const sentMessage = sendGetCreateWebhook(channel, convertedMessage);
  await message.delete();

  return sentMessage;
}
