import { WebhookMessageOptions } from 'discord.js';
import { Filter } from '../types';

export class RedditFilter implements Filter {
  name = 'Reddit';
  description = '[removed]';
  filter(): WebhookMessageOptions {
    return {
      avatarURL:
        'https://www.redditstatic.com/avatars/avatar_default_16_545452.png',
      username: '[deleted]',
      content: '[removed]',
    };
  }
}
