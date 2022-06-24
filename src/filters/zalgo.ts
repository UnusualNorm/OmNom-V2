import { Filter } from '../types';
import zalgo from "zalgo-js";

const ZalgoFilter: Filter = {
  id: 'zalgo',
  name: 'Zalgo',
  description: 'Am hacker man! 😎',

  filter: (message) => ({
    ...message,
    username: zalgo(message.username),
    content: zalgo(message.content)
  }),

  preview: zalgo
};

export { ZalgoFilter };
