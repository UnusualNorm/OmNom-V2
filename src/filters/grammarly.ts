import { correct, Grammarly } from '@stewartmcgown/grammarly-api';
import { Filter } from '../types';
const client = new Grammarly({
  username: process.env.GRAMMARLY_USERNAME,
  password: process.env.GRAMMARLY_PASSWORD,
});

const GrammarlyFilter: Filter = {
  id: 'grammarly',
  name: 'Grammarly',
  description: 'Did you write that email to your boss yet?',

  filter: async (message) => {
    const { corrected } = await client.analyse(message.content).then(correct);

    return {
      ...message,
      content: corrected?corrected:message.content,
    };
  },

  preview: async (text) => {
    const { corrected } = await client.analyse(text).then(correct);
    console.log(await client.analyse(text).then(correct))

    return corrected?corrected:text;
  },
};

export { GrammarlyFilter };
