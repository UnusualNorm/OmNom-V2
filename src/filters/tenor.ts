import { Filter } from '../types/filter';
import { ReFetch } from '../utils/tor';
const key = process.env.TENOR_APIKEY || 'LIVDSRZULELA';

type TenorSearchOutput = {
  results: {
    id: string;
    title: string;
    content_description: string;
    content_rating: string;
    h1_title: string;
    media: {
      nanowebm: {
        url: string;
        preview: string;
        dims: [number, number];
        size: number;
      };
      loopedmp4: {
        duration: number;
        dims: [number, number];
        preview: string;
        size: number;
        url: string;
      };
      mediumgif: {
        dims: [number, number];
        url: string;
        preview: string;
        size: number;
      };
      nanomp4: {
        url: string;
        size: number;
        dims: [number, number];
        preview: string;
        duration: number;
      };
      gif: {
        dims: [number, number];
        size: number;
        preview: string;
        url: string;
      };
      mp4: {
        preview: string;
        size: number;
        duration: number;
        url: string;
        dims: [number, number];
      };
      webm: {
        size: number;
        preview: string;
        dims: [number, number];
        url: string;
      };
      tinymp4: {
        preview: string;
        dims: [number, number];
        duration: number;
        size: number;
        url: string;
      };
      tinygif: {
        dims: [number, number];
        url: string;
        size: number;
        preview: string;
      };
      nanogif: {
        size: number;
        url: string;
        dims: [number, number];
        preview: string;
      };
      tinywebm: {
        url: string;
        preview: string;
        size: number;
        dims: [number, number];
      };
    }[];
    bg_color: string;
    created: number;
    itemurl: string;
    url: string;
    tags: string[];
    flags: string[];
    shares: number;
    hasaudio: boolean;
    hascaption: boolean;
    source_id: string;
    composite: unknown;
  }[];
  next: string;
};

async function getGif(query: string): Promise<string> {
  const res = await ReFetch(
    `https://g.tenor.com/v1/search?key=${key}&limit=1&q=${encodeURIComponent(
      query
    )}`
  );
  const json: TenorSearchOutput = JSON.parse(res);

  return json.results[0].media[0].tinygif.url;
}

const GifFilter: Filter = {
  id: 'gif',
  name: 'GIF',
  description: 'L + Ratio',

  filter: async (message) => ({
    ...message,
    content: await getGif(message.content),
  }),

  preview: getGif,
};

export { GifFilter };
