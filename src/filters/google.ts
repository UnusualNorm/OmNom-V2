import { Filter } from '../types/filter';
import translate from '@vitalets/google-translate-api';
import { SocksProxyAgent } from 'socks-proxy-agent';
const agent = new SocksProxyAgent('socks5://127.0.0.1:9050');

function isUri(value: string): boolean {
  if (!value) return false;

  // Check for illegal characters
  if (/[^a-z0-9:/?#[\]@!$&'()*+,;=.\-_~%]/i.test(value)) return false;

  // Check for hex escapes that aren't complete
  if (/%[^0-9a-f]/i.test(value) || /%[0-9a-f](:?[^0-9a-f]|$)/i.test(value))
    return false;

  // Directly from RFC 3986
  const split = value.match(
    /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/
  );

  if (!split) return false;

  const [, scheme, authority, path] = split;

  // Scheme and path are required, though the path can be empty
  if (!(scheme && scheme.length && path.length >= 0)) return false;

  // If authority is present, the path must be empty or begin with a /
  if (authority && authority.length)
    if (!(path.length === 0 || /^\//.test(path))) return false;
    else if (/^\/\//.test(path))
      // If authority is not present, the path must not start with //
      return false;

  // Scheme must begin with a letter, then consist of letters, digits, +, ., or -
  if (!/^[a-z][a-z0-9+\-.]*$/.test(scheme.toLowerCase())) return false;

  return true;
}

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
