import fs from 'fs';
import path from 'path';
import { Filter } from '../types';
const filterMap = new Map<string, Filter>();

// Get all files in "./"
const filterFiles = fs
  .readdirSync(__dirname)
  .filter((file) => !file.startsWith('index.'));
filterFiles.forEach(async (filterFile) => {
  // Loop through each export
  const filters: { [x: string]: Filter } = await import(
    path.join(__dirname, filterFile)
  );
  Object.keys(filters).forEach((filterName) => {
    // Add it to the exports
    const filter = filters[filterName];
    filterMap.set(filterName, filter);
  });
});

export default filterMap;
