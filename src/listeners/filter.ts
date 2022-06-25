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
    if (message.author.bot) return;
    if (
      message.content.startsWith(
        (await message.client.fetchPrefix(message)).toString()
      )
    )
      return;

    if (
      !(message.channel instanceof TextChannel) &&
      !(message.channel instanceof ThreadChannel)
    )
      return;

    await this.container.client.db.query(
      `CREATE TABLE IF NOT EXISTS guild_${message.guildId}_filters (filter VARCHAR(255), id VARCHAR(255), idType VARCHAR(255))`
    );

    if (
      !message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES') ||
      !message.channel.permissionsFor(message.guild.me).has('MANAGE_WEBHOOKS')
    )
      return;

    const roleIds = message.member.roles.cache.map((role) => role.id);
    const filters = await getActiveFilters(
      this.container.client.db,
      message.member.id,
      message.channelId,
      roleIds,
      message.guildId
    );
    if (!filters.length) return;

    let webhookOptions = messageToWebhookOptions(message);
    for (const { filter } of filters)
      webhookOptions = await filter(webhookOptions);

    await sendGetCreateWebhook(message.channel, webhookOptions);
    await message.delete();
  }
}
