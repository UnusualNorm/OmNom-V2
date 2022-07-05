// @ts-ignore
import { client } from 'tenorjs';
import { Filter } from '../types/filter';
const Tenor = client({
  Key: process.env.TENOR_APIKEY || 'LIVDSRZULELA',
  Filter: 'off',
  Locale: 'en_US',
  MediaFilter: 'minimal',
  DateFormat: 'D/MM/YYYY - H:mm:ss A',
});

const GifFilter: Filter = {
  id: 'gif',
  name: 'GIF',
  description: 'L + Ratio',

  filter: async (message) => {
    const search = await Tenor.Search.Query(message.content, '1');
    const url = search[0].media[0].tinygif.url;
    return {
      ...message,
      content: url,
    };
  },

  preview: async (text) => {
    const search = await Tenor.Search.Query(text, '1');
    const url = search[0].media[0].tinygif.url;
    return url;
  },
};

export { GifFilter };
