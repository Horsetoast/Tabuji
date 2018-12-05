const zhongwenDict = require('./dict.js');
const jsonfile = require('jsonfile');

const dict = new zhongwenDict();

// const getRandomWord = () => {
//   const vocabulary = dict.words1000.split('\n');
//   const line = Math.floor(Math.random() * vocabulary.length);
//   let result = null;
//   while (result == null) {
//     result = dict.wordSearch(vocabulary[line]);
//   }
//   const entry = selectBestEntryHelper(result.data);
//   const parsedEntry = dict.parseEntry(entry);
//   return parsedEntry;
// };

const selectBestEntryHelper = (arr) => {
  // let longestLen = 0;
  // let longestIndex = null;
  // arr.forEach((item, index) => {
  //   const itemLength = item[0].length;
  //   if (itemLength > longestLen) {
  //     longestIndex = index;
  //     longestLen = itemLength;
  //   }
  // });

  // return arr[longestIndex][0];
  return arr[0][0];
};

const removeUnwantedMeanings = (json) => {
  const chineseRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
  const bracketsRegex = /\[.*\]/;
  return json.map(word => ({
    ...word,
    meanings: word.meanings
      .filter(meaning => !meaning.match(chineseRegex))
      .filter(meaning => !meaning.match(bracketsRegex)),
  }))
    .filter(word => word.meanings.length > 0);
};

const removeDuplicateWords = (json) => {
  const map = {};
  return json.reduce((acc, cur) => {
    if (!map[cur.trad]) {
      map[cur.trad] = true;
      acc.push(cur);
    }
    return acc;
  }, []);
};

const traverseWords = () => {
  const words = [];
  const vocabulary = dict.words1000.split('\n');
  vocabulary.forEach((word, i) => {
    const result = dict.wordSearch(word);
    console.log('res', result);
    if (result) {
      const entry = selectBestEntryHelper(result.data);
      const parsedEntry = dict.parseEntry(entry);
      console.log(parsedEntry);
      words.push(parsedEntry);
      console.log('----------------------');
    }
  });

  const revisedWords = removeUnwantedMeanings(words);
  const uniqeWords = removeDuplicateWords(revisedWords);

  jsonfile.writeFile('./data/words1000.json', uniqeWords, (err) => {
    if (err) console.error(err);
  });
};

traverseWords();
