import { Filter } from '../types/filter';

function typoify(text: string) {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    const typoChoice = Math.floor(Math.random() * 3);

    switch (typoChoice) {
      case 0: {
        // Duplication of a letter
        const letterIndex = Math.floor(Math.random() * word.length);
        word = word.substring(0, letterIndex + 1) + word.substring(letterIndex);
        break;
      }

      case 1: {
        // Delete a random letter
        const missingLetterIndex = Math.floor(Math.random() * word.length);
        word =
          word.substring(0, missingLetterIndex) +
          word.substring(missingLetterIndex + 1);
        break;
      }

      case 2: {
        // Swap two letters
        let swapLetterIndex;
        let swapLetter2Index;

        if (word.split('').every((char, i, arr) => char === arr[0]))
          word = typoify(word);

        while (word[swapLetterIndex] == word[swapLetter2Index]) {
          swapLetterIndex = Math.floor(Math.random() * word.length - 1);
          swapLetter2Index = swapLetterIndex + 1;
        }

        word =
          word.substring(0, swapLetterIndex) +
          word[swapLetter2Index] +
          word[swapLetterIndex] +
          word.substring(swapLetter2Index + 1);

        break;
      }
    }

    words[i] = word;
  }
  return words.join(' ');
}

const TypoFilter: Filter = {
  id: 'typo',
  name: 'Typo',
  description: 'Oh slly me, I madde a tpyo!',

  filter: (message) => ({
    ...message,
    content: typoify(message.content),
  }),

  preview: (text) => typoify(text),
};

export { TypoFilter };
