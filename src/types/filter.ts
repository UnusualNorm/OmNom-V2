import { WebhookMessageOptions } from 'discord.js';

export interface Filter {
  id: string;
  name: string;
  description: string;

  filter(
    message: WebhookMessageOptions
  ): WebhookMessageOptions | Promise<WebhookMessageOptions>;

  preview(text: string): string | Promise<string>;
}
