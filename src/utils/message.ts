import { Message, TextChannel, ThreadChannel } from 'discord.js';
import {
  seperateThreadID,
  getCreateWebhook,
  messageToWebhookOptions,
} from './';

export async function moveMessage(
  message: Message,
  channel: TextChannel | ThreadChannel
) {
  const victimChannel = message.channel;

  // Make sure we are in a guild
  if (victimChannel.type != 'GUILD_TEXT') throw new Error('INVALID_CHANNEL');

  // Make sure we have permissions
  const victimMe = message.guild.me;
  const me = channel.guild.me;

  if (
    !victimChannel.permissionsFor(victimMe).has('MANAGE_MESSAGES') ||
    !channel.permissionsFor(me).has('MANAGE_WEBHOOKS')
  )
    throw new Error('INVALID_PERMISSIONS');

  // Get webhook for base channel
  const { baseChannel, threadId } = seperateThreadID(channel);
  const webhook = await getCreateWebhook(baseChannel);

  // Convert and send message
  const convertedMessage = messageToWebhookOptions(message);
  const sentMessage = await webhook.send({
    ...convertedMessage,
    threadId,
  });

  // Delete and return new message
  await message.delete();
  return sentMessage;
}
