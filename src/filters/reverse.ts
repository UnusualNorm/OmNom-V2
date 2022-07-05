import { Filter } from '../types/filter';

const reverse = (text: string) => text.split('').reverse().join('');
const ReverseFilter: Filter = {
  id: 'reverse',
  name: 'Reverse',
  description: '!em pleh ,on hO',

  filter: (message) => ({
    ...message,
    username: reverse(message.username),
    content: reverse(message.content),
  }),

  preview: (text) => reverse(text),
};

export { ReverseFilter };
