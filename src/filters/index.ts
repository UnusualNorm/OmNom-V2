import fs from 'fs';
import path from 'path';
import { Filter } from '../types';

export default (async function () {
  const filterMap = new Map<string, Filter>();
  const filterFiles = fs
    .readdirSync(__dirname)
    .filter((file) => !file.startsWith('index.'));

  for (const filterFile of filterFiles) {
    const filters: { [x: string]: Filter } = await import(
      path.join(__dirname, filterFile)
    );

    for (const filterName of Object.keys(filters)) {
      const filter = filters[filterName];
      filterMap.set(filter.id, filter);
    }
  }

  return filterMap;
})();
