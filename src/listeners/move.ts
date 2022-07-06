import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message, TextChannel, ThreadChannel } from 'discord.js';
import {
  messageToWebhookOptions,
  sendGetCreateWebhook,
} from '../utils/webhook';

@ApplyOptions<Listener.Options>({
  name: 'move',
  enabled: true,
  event: 'messageCreate',
})
export class MoveListener extends Listener {
  async run(message: Message) {
    if (message.partial) await message.fetch();
    if (message.author.bot) return;

    if (
      message.type != 'REPLY' ||
      // Check if the message "content" is just the prefix
      message.content.replace(/<#\d{17,19}>/, '').trim() !=
        message.client.fetchPrefix(message) ||
      !(
        message.channel instanceof TextChannel ||
        message.channel instanceof ThreadChannel
      ) ||
      !message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES') ||
      !message.channel
        .permissionsFor(message.client.user)
        .has('MANAGE_MESSAGES')
    )
      return;

    const channel = message.mentions.channels.first();
    if (!channel) return;

    if (
      !(channel instanceof TextChannel || channel instanceof ThreadChannel) ||
      !channel.permissionsFor(message.member).has('MANAGE_WEBHOOKS')
    )
      return;

    const reference = await message.fetchReference();
    const webhookOptions = messageToWebhookOptions(reference);

    await sendGetCreateWebhook(channel, webhookOptions);
    await reference.delete();
    await message.delete();
  }
}
