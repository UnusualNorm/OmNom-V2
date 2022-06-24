import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Message, TextChannel, ThreadChannel } from 'discord.js';
import {
  getActiveFilters,
  messageToWebhookOptions,
  sendGetCreateWebhook,
} from '../utils';

@ApplyOptions<Listener.Options>({
  name: 'filter',
  enabled: true,
  event: 'messageCreate',
})
export class FilterListener extends Listener {
  async run(message: Message) {
    const { channel, guild, guildId, channelId, member, author } = message;

    if (author.bot) return;
    if (
      message.content.startsWith(
        (await message.client.fetchPrefix(message)).toString()
      )
    )
      return;

    if (
      !(channel instanceof TextChannel) &&
      !(channel instanceof ThreadChannel)
    )
      return;

    if (
      !channel.permissionsFor(guild.me).has('MANAGE_MESSAGES') ||
      !channel.permissionsFor(guild.me).has('MANAGE_WEBHOOKS')
    )
      return;

    const roleIds = member.roles.cache.map((role) => role.id);
    const filters = await getActiveFilters(
      this.container.client.db,
      member.id,
      channelId,
      roleIds,
      guildId
    );
    if (!filters.length) return;

    let webhookOptions = messageToWebhookOptions(message);
    for (const { filter } of filters)
      webhookOptions = await filter(webhookOptions);

    await sendGetCreateWebhook(channel, webhookOptions);
    await message.delete();
  }
}
