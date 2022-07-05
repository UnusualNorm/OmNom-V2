import { Filter } from '../types/filter';

const RedditFilter: Filter = {
  id: 'reddit',
  name: 'Reddit',
  description: '[removed]',

  filter: () => ({
    avatarURL:
      'https://www.redditstatic.com/avatars/avatar_default_16_545452.png',
    username: 'u/[deleted]',
    content: '[removed]',
  }),

  preview: () => '[removed]',
};
export { RedditFilter };
