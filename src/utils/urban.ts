import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';
const agent = new SocksProxyAgent('socks5://127.0.0.1:9050');

export interface UrbanEntry {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: string;
  example: string;
  thumbs_down: number;
}

export async function urbanRequest(
  term: string
): Promise<{ list: UrbanEntry[] }> {
  const query = new URLSearchParams({ term });
  const url = `http://api.urbandictionary.com/v0/define?${query}`;

  const res = await fetch(url, { agent });
  const json = await res.json();
  return json;
}
