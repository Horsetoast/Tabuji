const zhongwenDict = require('./dict.js');
const jsonfile = require('jsonfile');

const dict = new zhongwenDict();

const getRandomWord = () => {
  const vocabulary = dict.words1000.split('\n');
  const line = Math.floor(Math.random() * vocabulary.length);
  let result = null;
  while (result == null) {
    result = dict.wordSearch(vocabulary[line]);
  }
  const entry = selectBestEntryHelper(result.data);
  const parsedEntry = dict.parseEntry(entry);
  return parsedEntry;
};

const selectBestEntryHelper = (arr) => {
  let longestLen = 0;
  let longestIndex = null;
  arr.forEach((item, index) => {
    const itemLength = item[0].length;
    if (itemLength > longestLen) {
      longestIndex = index;
      longestLen = itemLength;
    }
  });

  return arr[longestIndex][0];
};

const traverseWords = () => {
  const words = [];
  const vocabulary = dict.words1000.split('\n');
  vocabulary.forEach((word, i) => {
    const result = dict.wordSearch(word);
    if (result) {
      const entry = selectBestEntryHelper(result.data);
      const parsedEntry = dict.parseEntry(entry);
      console.log(parsedEntry);
      words.push(parsedEntry);
      console.log('----------------------');
    }
  });


  jsonfile.writeFile('./data/words1000.json', words, (err) => {
    if (err) console.error(err);
  });
};

traverseWords();
