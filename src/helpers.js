import wordsList from '../data/words1000.json';

export const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const getRandomColor = () => {
  // from 80 to 360 because yellow is ugly
  const hue = Math.floor(Math.random() * 280) + 80;
  return `hsl(${hue}, 50%, 25%)`;
};

export const getRandomWord = () => {
  const { length } = wordsList;
  const randomIndex = Math.floor(Math.random() * length);
  return wordsList[randomIndex];
};

export const getRandomWordMeaning = (word) => {
  const { length } = word.meanings;
  const randomIndex = Math.floor(Math.random() * length);
  return word.meanings[randomIndex];
};

export const makeWordQuestion = (word, optionsCount = 4) => {
  const options = [];

  const correctMeaning = getRandomWordMeaning(word);
  options.push(correctMeaning);

  for (let i = 0; i < optionsCount - 1; i++) {
    let nextWord = getRandomWord();
    let meaning = getRandomWordMeaning(nextWord);
    while (options.indexOf(meaning) !== -1) {
      nextWord = getRandomWord();
      meaning = getRandomWordMeaning(word);
    }
    options.push(meaning);
  }

  const shuffledOptions = shuffle(options);
  const correctOption = shuffledOptions.indexOf(correctMeaning);

  return {
    options: shuffledOptions,
    correctOption,
  };
};

export const isDifferentDay = (d1, d2) =>
  d1.getFullYear() !== d2.getFullYear() ||
  d1.getMonth() !== d2.getMonth() ||
  d1.getDate() !== d2.getDate();

export const isValidDate = d => d instanceof Date && !isNaN(d);
