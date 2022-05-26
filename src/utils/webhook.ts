import { Message, TextChannel, WebhookMessageOptions } from 'discord.js';

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
  const createdWebhook = await channel.createWebhook(
    me.nickname ? me.nickname : user.username,
    {
      reason: `Webhook used for ${user.username}#${user.tag}!`,
      avatar: me.displayAvatarURL(),
    }
  );
  return createdWebhook;
}

export function messageToWebhookOptions(
  message: Message
): WebhookMessageOptions {
  const { content, author, member, attachments } = message;
  let avatarURL;

  // TODO: Find a way to grab webhook avatar and username for the spicific message
  if (!message.webhookId) {
    avatarURL = member.displayAvatarURL();
  }

  return {
    avatarURL,
    username: member.nickname ? member.nickname : author.username,
    content,
    files: attachments.toJSON(),
  };
}
