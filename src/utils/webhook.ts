import { isTextChannel, isThreadChannel } from '@sapphire/discord.js-utilities';
import {
  Message,
  TextChannel,
  ThreadChannel,
  WebhookMessageOptions,
} from 'discord.js';
import { seperateThreadID } from './';

export async function getCreateWebhook(channel: TextChannel) {
  // Make sure we have permissions
  const me = channel.guild.me;
  if (!channel.permissionsFor(me).has('MANAGE_WEBHOOKS'))
    throw new Error('PERMISSIONS');

  // Check if we already have an authorized webhook
  const webhooks = await channel.fetchWebhooks();
  const foundWebhook = webhooks.find((wh) => (wh.token ? true : false));
  if (foundWebhook) return foundWebhook;

  // We don't have a webhook, create one
  const user = me.user;
  const createdWebhook = await channel.createWebhook(user.username, {
    reason: `Webhook used by ${user.username}#${user.tag}!`,
    avatar: me.displayAvatarURL(),
  });
  return createdWebhook;
}

export function messageToWebhookOptions(
  message: Message
): WebhookMessageOptions {
  const { channel, content, author, member, attachments, tts } = message;

  // Get member display avatar if we are not a webhook
  let avatarURL = author.avatarURL();
  if (!message.webhookId) avatarURL = member.displayAvatarURL();

  // If the user has a nickname, use it
  let username = author.username;
  if (!message.webhookId && member.nickname) username = member.nickname;

  // Files for webhooks are not the same as files for messages
  const files = attachments.toJSON();

  // Make sure we include the threadId
  let threadId;
  if (isThreadChannel(channel) || isTextChannel(channel))
    ({ threadId } = seperateThreadID(channel));

  return {
    avatarURL,
    username,
    content,
    files,
    tts,
    threadId,
  };
}

export async function sendGetCreateWebhook(
  channel: TextChannel | ThreadChannel,
  message: WebhookMessageOptions
) {
  // Get webhook for base channel
  const { baseChannel, threadId } = seperateThreadID(channel);
  const webhook = await getCreateWebhook(baseChannel);

  // Convert and send message
  const sentMessage = await webhook.send({
    ...message,
    threadId,
  });

  return sentMessage;
}
