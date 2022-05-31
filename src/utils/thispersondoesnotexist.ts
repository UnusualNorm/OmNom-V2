import fetch from 'node-fetch';
import { SocksProxyAgent } from 'socks-proxy-agent';
const agent = new SocksProxyAgent('socks5://127.0.0.1:9050');

export interface TPDNEOutput {
  generated: string;
  src: string;
  name: string;
}

export async function getFakeFace() {
  const res = await fetch(
    `https://this-person-does-not-exist.com/en?new=${Date.now()}`,
    { agent }
  );

  const json: TPDNEOutput = await res.json();
  json.src = `https://this-person-does-not-exist.com${json.src}`;
  return json;
}
