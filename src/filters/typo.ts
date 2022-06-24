import { Filter } from '../types';

const typoify = (text: string) => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    const typoChoice = Math.floor(Math.random() * 3);

    switch (typoChoice) {
      case 0: {
        // Duplication of a letter
        const letterIndex = Math.floor(Math.random() * word.length);
        word =
          word.substring(0, letterIndex) +
          word.substring(letterIndex, letterIndex + 2);
        break;
      }

      case 1: {
        // Missing a letter
        const missingLetterIndex = Math.floor(Math.random() * word.length);
        word =
          word.substring(0, missingLetterIndex) +
          word.substring(missingLetterIndex + 1);
        break;
      }

      case 2: {
        // Swapping two letters
        const firstLetterIndex = Math.floor(Math.random() * word.length);
        const secondLetterIndex = Math.floor(Math.random() * word.length);
        word =
          word.substring(0, firstLetterIndex) +
          word[secondLetterIndex] +
          word[firstLetterIndex] +
          word.substring(secondLetterIndex + 1);
        break;
      }
    }

    words[i] = word;
  }
  return words.join(' ');
};

const TypoFilter: Filter = {
  id: 'typo',
  name: 'Typo',
  description: 'Oh slly me, I mde a tpyo!',

  filter: (message) => ({
    ...message,
    content: typoify(message.content),
  }),

  preview: (text) => typoify(text),
};

export { TypoFilter };
