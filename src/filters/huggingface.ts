import { Filter } from '../types/filter';
import { ReFetch } from '../utils/tor';

type inferenceOutput = {
  generated_text: string;
}[];

// https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B
// request: { inputs: string }
// output:  { generated_text: string }
const verboseify = async (text: string): Promise<string> => {
  const out = await ReFetch(
    'https://api-inference.huggingface.co/models/EleutherAI/gpt-j-6B',
    {
      method: 'POST',
      body: JSON.stringify({
        inputs: text,
      }),
    }
  );
  const json: inferenceOutput = JSON.parse(out);
  return json[0].generated_text;
};

const verboseFilter: Filter = {
  name: 'Verbose',
  id: 'verbose',
  description: 'Makes all of your messages have a word count minimum!',

  filter: async (message) => ({
    ...message,
    content: await verboseify(message.content),
  }),

  preview: (text) => verboseify(text),
};

export { verboseFilter };
