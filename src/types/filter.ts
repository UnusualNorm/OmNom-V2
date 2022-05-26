import { WebhookMessageOptions } from 'discord.js';

export interface Filter {
  name: string;
  description: string;
  filter(
    message: WebhookMessageOptions
  ): WebhookMessageOptions | Promise<WebhookMessageOptions>;
}
