import { Filter } from '../types/filter';

const susPhrase = ['when', 'the', 'imposter', 'is', 'sus'];

function susify(message: string): string {
  const split = message.split(' ');
  for (let i = 0; i < split.length; i++) {
    const currentItteration = i % susPhrase.length;
    split[i] = susPhrase[currentItteration];
  }
  return split.join(' ');
}

const SusFilter: Filter = {
  name: 'SUS',
  id: 'sus',
  description: 'SUS! SUS! SUS! SUS! SUS!',

  filter: async (message) => ({
    ...message,
    avatarURL:
      'https://static.wikia.nocookie.net/among-us-wiki/images/1/13/Shhh%21.png',
    username: 'SUSSY IMPOSTER!',
    content: susify(message.content),
  }),
  preview: susify,
};

export { SusFilter };
