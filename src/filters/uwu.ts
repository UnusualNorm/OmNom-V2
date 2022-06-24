import { Filter } from '../types';
import UWUifier from 'uwuifier';
const uwu = new UWUifier();

const UWUFilter: Filter = {
  id: 'uwu',
  name: 'UWU',
  description: "OWO What's this?",

  filter: (message) => ({
    ...message,
    username: uwu.uwuifyWords(message.username),
    content: uwu.uwuifySentence(message.content),
  }),

  preview: (text) => uwu.uwuifySentence(text),
};

export { UWUFilter };
