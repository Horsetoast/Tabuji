/*
        Random Chinese Word Chrome Extension
        Copyright (C) 2018 Matus Peciar

        ---

        Originally based on Zhongzhong - A Chinese-English Popup Dictionary
        Copyright (C) 2015 Pablo Roman
        https://chrome.google.com/webstore/detail/dggcgdjndddfmcfoipccicfoajmciacf

        ---

        Originally based on Zhongwen 4.0.1
        Copyright (C) 2011 Christian Schiller
        https://chrome.google.com/extensions/detail/kkmlkkjojmombglmlpbpapmhcaljjkde

        ---

        Originally based on Rikaikun 0.8
        Copyright (C) 2010 Erek Speed
        http://code.google.com/p/rikaikun/

        ---

        Originally based on Rikaichan 1.07
        by Jonathan Zarate
        http://www.polarcloud.com/

        ---

        Originally based on RikaiXUL 0.4 by Todd Rudick
        http://www.rikai.com/
        http://rikaixul.mozdev.org/

        ---

        This program is free software; you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation; either version 2 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program; if not, write to the Free Software
        Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

        ---

        Please do not change or remove any of the copyrights or links to web pages
        when modifying any of the files.

*/
const fs = require('fs');
const PinyinConverter = require('./src/pinyin_convertor.js');

function zhongwenDict() {
  this.loadDictionary();
}

module.exports = zhongwenDict;

zhongwenDict.prototype = {

  wordDict: undefined,
  wordIndex: undefined,

  grammarKeywords: {},

  fileRead(url) {
    return fs.readFileSync(url, 'utf8');
  },

  find(data, text) {
    const tlen = text.length;
    let beg = 0;
    let end = data.length - 1;
    let i;
    let mi;
    let mis;

    while (beg < end) {
      mi = Math.floor((beg + end) / 2);
      i = data.lastIndexOf('\n', mi) + 1;

      mis = data.substr(i, tlen);
      if (text < mis) end = i - 1;
      else if (text > mis) beg = data.indexOf('\n', mi + 1) + 1;
      else return data.substring(i, data.indexOf('\n', mi + 1));
    }
    return null;
  },

  loadDictionary() {
    this.words1000 = this.fileRead('./data/words1000.txt');
    this.vocabulary = this.fileRead('./data/vocabulary.u8');
    this.wordDict = this.fileRead('./data/cedict_ts.u8');
    this.wordIndex = this.fileRead('./data/cedict.idx');

    this.hanziData = this.fileRead('./data/hanzi.dat').split('\n');
    // this.radData = this.fileReadArray(chrome.extension.getURL("../data/radicals.dat"), 'UTF-8');
    this.radData = ['亻		にんべん	person	伊位依偉荏液億俺化仮'];

    const grammarKeywordFile = this.fileRead('./data/grammarKeywordsMin.json');
    this.grammarKeywords = JSON.parse(grammarKeywordFile);
  },

  hasKeyword(keyword) {
    return this.grammarKeywords[keyword];
  },

  getWordByOffset(offset) {
    const dict = this.wordDict;
    const dentry = dict.substring(offset, dict.indexOf('\n', offset));
    return dentry;
  },

  singleWordSearch(word, max) {
    const entry = {};

    const dict = this.wordDict;
    const index = this.wordIndex;
    let maxTrim = 7;
    const have = {};
    let count = 0;
    let maxLen = 0;

    if (max != null) {
      maxTrim = max;
    }

    entry.data = [];

    let ix = this.find(index, `${word},`);
    if (!ix) {
      return;
    }
    ix = ix.split(',');

    for (let j = 1; j < ix.length; ++j) {
      const offset = ix[j];
      if (have[offset]) continue;

      const dentry = dict.substring(offset, dict.indexOf('\n', offset));

      if (count >= maxTrim) {
        entry.more = 1;
        break;
      }

      have[offset] = 1;
      ++count;
      if (maxLen == 0) maxLen = word.length;

      entry.data.push([dentry, word]);
    } // for j < ix.length

    if (entry.data.length == 0) return null;

    entry.matchLen = maxLen;
    return entry;
  },

  wordSearch(word, max) {
    const entry = {};

    const dict = this.wordDict;
    const index = this.wordIndex;
    let maxTrim = 7;
    const cache = {};
    const have = {};
    let count = 0;
    let maxLen = 0;

    if (max != null) {
      maxTrim = max;
    }

    entry.data = [];

    while (word.length > 0) {
      let ix = cache[word];
      if (!ix) {
        ix = this.find(index, `${word},`);
        if (!ix) {
          cache[word] = [];
          continue;
        }
        ix = ix.split(',');
        cache[word] = ix;
      }

      for (let j = 1; j < ix.length; ++j) {
        const offset = ix[j];
        if (have[offset]) continue;

        const dentry = dict.substring(offset, dict.indexOf('\n', offset));

        if (count >= maxTrim) {
          entry.more = 1;
          break;
        }

        have[offset] = 1;
        ++count;
        if (maxLen == 0) maxLen = word.length;

        entry.data.push([dentry, word]);
      } // for j < ix.length
      if (count >= maxTrim) break;
      word = word.substr(0, word.length - 1);
    } // while word.length > 0

    if (entry.data.length == 0) return null;

    entry.matchLen = maxLen;
    return entry;
  },

  hanziSearch(char) {
    const data = this.findHanzi(char);
    if (!data) return null;

    radical = 1;

    const radicals = [];

    for (let i = 0; i < this.radData.length; i++) {
      if (radical != i && this.radData[i].indexOf(char) != -1) {
        radicals.push(this.radData[i].split('\t'));
      }
    }

    return {
      hanzi: char,
      pinyin: data.kMandarin,
      definition: data.kDefinition,
      simplified: data.kSimplifiedVariant,
      traditional: data.kTraditionalVariant,
      variant: data.kSemanticVariant,
      specializedVariant: data.kSpecializedSemanticVariant,
      freq: data.kFrequency,
      strokes: data.kTotalStrokes,
      radical: data.radical,
      hsk: data.hsk,
      dict: {
        fourcorner: data.kFourCornerCode,
        cangjie: data.kCangjie,
        cangjiech: data.kCangjieCh,
        hanyu: data.kHanYu,
        kangxi: data.kKangXi,
        phonetic: data.kPhonetic,
        rth: data.rth,
        rthkeyword: data.rthkeyword,
        rsh: data.rsh,
        rshkeyword: data.rshkeyword,
      },
    };
  },

  findHanzi(char) {
    const data = this.hanziData;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === char) {
        const result = {};

        const fields = data[0].split('|');
        const arr = data[i].split('|');

        for (let j = 0; j < arr.length; j++) {
          result[fields[j]] = arr[j];
        }

        return result;
      }
    }

    return null;
  },

  translate(text) {
    let e;
    let o;
    let skip;

    o = {};
    o.data = [];
    o.textLen = text.length;

    while (text.length > 0) {
      e = this.wordSearch(text, 1);
      if (e != null) {
        if (o.data.length >= 7) {
          o.more = 1;
          break;
        }
        o.data.push(e.data[0]);
        skip = e.matchLen;
      } else {
        skip = 1;
      }
      text = text.substr(skip, text.length - skip);
    }

    if (o.data.length == 0) {
      return null;
    }

    o.textLen -= text.length;
    return o;
  },

  parseEntry(entry) {
    const match = entry.match(/(.*)!?\s(.*) \[(.*)( , )?(.*)] \/(.*)\//);
    return {
      trad: match[1],
      simp: match[2],
      pinyin: PinyinConverter.convert(match[3]),
      meanings: match[match.length - 1].split('/'),
    };
  },
};
