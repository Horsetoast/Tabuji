import wordsList from '../data/words1000.json';

/* eslint-disable */
export const getRandomColor = () => {
  // from 80 to 360 because yellow is ugly
  const hue = Math.floor(Math.random() * 280) + 80;
  return `hsl(${hue}, 50%, 25%)`;
};

export const getRandomWord = () => {
  const length = wordsList.length;
  const randomIndex = Math.floor(Math.random() * length)
  return wordsList[randomIndex]
}

export const getRandomWordMeaning = (word) => {
  const length = word.meanings.length;
  const randomIndex = Math.floor(Math.random() * length)
  return word.meanings[randomIndex];
}

export const getWordQuiz = (word, optionsCount = 4) => {
  const options = [];

  const correctMeaning = getRandomWordMeaning(word);
  options.push(correctMeaning);


  for (let i = 0; i < (optionsCount - 1); i++) {
    let word = getRandomWord();
    let meaning = getRandomWordMeaning(word);
    while (options.indexOf(meaning) !== -1) {
      word = getRandomWord();
      meaning = getRandomWordMeaning(word);
    }
    options.push(meaning)
  }

  return {
    options,
    correctOption: 0
  };
}

export const isDifferentDay = (d1, d2) => {
  return d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate();
}

export const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
}