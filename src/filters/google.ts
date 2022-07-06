import { Filter } from '../types/filter';
import translate from '@vitalets/google-translate-api';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { isUri } from '../utils/uri';
const agent = new SocksProxyAgent('socks5://127.0.0.1:9050');

const spanishify = async (message: string): Promise<string> => {
  const { text } = await translate(
    message,
    { to: 'es' },
    {
      agent: {
        https: agent,
      },
    }
  );

  const split = text.split(' ');
  for (let i = 0; i < split.length; i++) {
    const word = split[i];
    if (isUri(word))
      split[
        i
      ] = `https://translate.google.com/translate?sl=auto&tl=es&u=${encodeURIComponent(
        word
      )}`;
  }

  const newText = split.join(' ');
  return newText;
};

const SpanishFilter: Filter = {
  id: 'spanish',
  name: 'Spanish',
  description: '*Nobody ever expects the spanish inquisition!*',

  filter: async (message) => ({
    ...message,
    content: await spanishify(message.content),
  }),
  preview: spanishify,
};
export { SpanishFilter };
