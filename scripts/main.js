function Tabuji(data) {
  const storage = data;
  const dict = new zhongwenDict();
  const timerPeriods = [
    { text: 'Every new tab', ms: 0 },
    { text: '1 minute', ms: 60000 },
    { text: '15 minutes', ms: 60000 * 15 },
    { text: '1 hour', ms: 60000 * 60 },
    { text: '1 day', ms: 60000 * 60 * 12 },
  ];
  const DEFAULT_PERIOD = 0;
  let periodIndex = storage.periodIndex != null ? storage.periodIndex : DEFAULT_PERIOD;

  const getRandomWord = () => {
    const wordIndex = dict.wordIndex.split('\n');
    const line = Math.floor(Math.random() * wordIndex.length);
    const offset = wordIndex[line].split(',')[1];
    const randomWord = dict.getWordByOffset(offset);
    return dict.parseEntry(randomWord);
  };

  const replaceWord = (word) => {
    $('#word-trad').html(word.trad);
    $('#word-pinyin').html(word.pinyin);
    $('#word-meaning').html('');
    const $list = $('#word-meaning');
    $.each(word.meanings, (i, val) => {
      $('<li/>')
        .text(val)
        .appendTo($list);
    });
    $list.appendTo('#word-meaning');
  };

  const replaceTimerButton = (period) => {
    $('#timer-button').removeClass('hidden').find('span').text(period.text);
  };

  const skipWord = () => {
    const currentTs = Date.now();
    const newWord = getRandomWord();
    chrome.storage.sync.set({ word: newWord }, () => {
      console.log('Word saved to storage', newWord);
    });
    chrome.storage.sync.set({ ts: currentTs }, () => {
      console.log('Timestamp saved to storage', currentTs);
    });
    replaceWord(newWord);
  };

  const setNextPeriod = () => {
    periodIndex = (periodIndex + 1) % (timerPeriods.length);
    chrome.storage.sync.set({ periodIndex }, () => {
      console.log('Timer changed to', timerPeriods[periodIndex]);
      replaceTimerButton(timerPeriods[periodIndex]);
    });
  };

  const toMinutes = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const init = () => {
    const currentTs = Date.now();
    let newWord = storage.word || getRandomWord();
    const wordPeriod = timerPeriods[periodIndex];

    const prevTs = storage.ts || Date.now() + wordPeriod.ms;
    const remaining = wordPeriod.ms - (currentTs - prevTs);

    console.log(`Remaining time until next word ${remaining < 0 ? 0 : toMinutes(remaining)}`);
    if (currentTs - prevTs > wordPeriod.ms) {
      newWord = getRandomWord();
      chrome.storage.sync.set({ word: newWord }, () => {
        console.log('Word saved to storage', newWord);
      });
      chrome.storage.sync.set({ ts: currentTs }, () => {
        console.log('Timestamp saved to storage', currentTs);
      });
    }

    replaceWord(newWord);
    replaceTimerButton(wordPeriod);
  };

  return {
    init,
    setNextPeriod,
    skipWord,
  };
}

$(document).ready(() => {
  chrome.storage.sync.get(null, (data) => {
    const app = Tabuji(data);
    app.init();

    $('.tooltip').tooltipster({
      theme: 'tooltipster-borderless',
      delay: 100,
      animation: 'grow',
    });
    $('#timer-button').on('click', () => {
      app.setNextPeriod();
    });
    $('#skip-button').on('click', () => {
      // const currentTs = Date.now();
      // const newWord = app.getRandomWord();
      // app.saveWordAndTimestamp(newWord, currentTs);
      app.skipWord();
    });
  });
});
