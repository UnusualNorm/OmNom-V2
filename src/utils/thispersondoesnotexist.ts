import { ReFetch } from './tor';

export interface TPDNEOutput {
  generated: string;
  src: string;
  name: string;
}

export async function getFakeFace() {
  const res = await ReFetch(
    `https://this-person-does-not-exist.com/en?new=${Date.now()}`
  );

  const json: TPDNEOutput = JSON.parse(res);
  json.src = `https://this-person-does-not-exist.com${json.src}`;
  return json;
}
