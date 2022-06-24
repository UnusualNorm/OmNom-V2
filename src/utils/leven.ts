const levenshteinDistance = (a: string, b: string) => {
  let tmp;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  if (a.length > b.length) {
    tmp = a;
    a = b;
    b = tmp;
  }

  let i, j, res;
  const alen = a.length,
    blen = b.length,
    row = Array(alen);
  for (i = 0; i <= alen; i++) row[i] = i;

  // Holy crap, I just copied and pasted this, WTF even is this?
  for (i = 1; i <= blen; i++) {
    res = i;
    for (j = 1; j <= alen; j++) {
      tmp = row[j - 1];
      row[j - 1] = res;
      res =
        b[i - 1] === a[j - 1]
          ? tmp
          : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1));
    }
  }
  return res;
};

const sortByLevenshteinDistance = (value: string, a: string, b: string) => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  if (aLower.startsWith(value) || bLower.startsWith(value)) {
    return -1;
  }
  if (aLower.endsWith(value) || bLower.endsWith(value)) {
    return 1;
  }

  const distance1 = levenshteinDistance(value, aLower);
  const distance2 = levenshteinDistance(value, bLower);

  return distance1 - distance2;
};
export { sortByLevenshteinDistance };
