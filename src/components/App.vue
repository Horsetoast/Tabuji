<template>
  <transition name="fade" appear mode="out-in">
    <div id="wrapper" v-if="word && options.length" :key="word.trad">
      <div id="word">
        <h1>{{word.trad}}</h1>
        <p class="word-pinyin">{{word.pinyin}}</p>
      </div>
      <div id="quiz-wrapper">
        <div id="quiz">
          <div id="quiz-header">
            <transition name="fade" mode="out-in">
              <p v-if="status === 'word_ready'" key="p1">Choose the correct meaning</p>
              <p v-else-if="status === 'answered_wrong'" key="p2">Nopes. Try again?</p>
              <p v-else-if="status === 'answered_correct'" key="p3">Correct!</p>
            </transition>
          </div>
          <ul id="quiz-options">
            <li
              v-for="(option, i) in options"
              :key="i"
              class="options-item"
              :class="{
            'answered-wrong': guessed[i] && i !== correctOption,
            'answered-correct': guessed[i] && i === correctOption
          }"
              @click="chooseAnswer(i)"
            >
              <span>{{ option }}</span>
            </li>
          </ul>
        </div>
        <div id="next-word" @click="nextQuiz" v-show="status === 'answered_correct'">
          <span>Next word?</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {
  getRandomColor,
  getRandomWord,
  getRandomWordMeaning,
  getWordQuiz
} from "../helpers.js";

export default {
  data() {
    return {
      status: "no_word",
      bgColor: null,
      word: {
        meanings: [],
        trad: null,
        simp: null,
        pinyin: null
      },
      options: [],
      correctOption: null,
      guessed: {}
    };
  },
  watch: {
    bgColor: "setBgColor"
  },
  created() {
    console.log("created");
    chrome.storage.sync.get(null, data => {
      console.log("Loaded", data);
      const { word, options, correctOption, bgColor } = data;
      if (word != null && options != null && correctOption != null) {
        this.word = word;
        this.options = options;
        this.correctOption = correctOption;
        this.bgColor = bgColor;
        this.status = "word_ready";
      } else {
        this.nextQuiz();
      }
    });
  },
  mounted() {
    this.setBgColor();
  },
  methods: {
    setBgColor() {
      document.body.style["backgroundColor"] = this.bgColor;
    },
    chooseAnswer(index) {
      if (this.status === "answered_correct") {
        return;
      }

      if (index === this.correctOption) {
        this.status = "answered_correct";
        this.clearStoredQuiz();
      } else {
        this.status = "answered_wrong";
      }
      this.$set(this.guessed, index, true);
    },
    nextQuiz() {
      const word = getRandomWord();
      console.log("word", word);
      this.word = word;
      const data = getWordQuiz(word);
      this.options = data.options;
      this.correctOption = data.correctOption;
      this.bgColor = getRandomColor();
      if (!document.body.style["transition"]) {
        document.body.style["transition"] = "background-color 1s ease-in";
      }      
      this.status = "word_ready";
      this.guessed = {};
      this.saveQuiz();
    },
    clearStoredQuiz() {
      chrome.storage.sync.set(
        {
          word: null,
          options: [],
          correctOption: null,
          bgColor: null
        },
        () => {
          console.log("Quiz cleared from storage");
        }
      );
    },
    saveQuiz() {
      chrome.storage.sync.set(
        {
          word: this.word,
          options: this.options,
          correctOption: this.correctOption,
          bgColor: this.bgColor
        },
        () => {
          console.log("Quiz saved to storage");
        }
      );
    }
  }
};
</script>

<style lang="scss">
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateX(-10px)
  }
  100% {
    opacity: 1;
    transform: translateX(0)
  }
}
@keyframes fade-out {
  0% {
    opacity: 1;
    transform: translateX(0)
  }
  100% {
    opacity: 0;
    transform: translateX(10px)
  }
}
@keyframes shake {
  20% {
    transform: translate3d(-4px, 0, 0);
  }

  40% {
    transform: translate3d(4px, 0, 0);
  }

  60% {
    transform: translate3d(-2px, 0, 0);
  }

  100% {
    transform: translate3d(0px, 0, 0);
  }
}
.fade-enter-active {
  animation: fade-in 0.3s ease-in;
}
.fade-leave-active {
  animation: fade-out 0.3s ease-in;
}

html,
body {
  display: flex;
  justify-content: center;
}

#wrapper {
  width: 50%;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

#word {
  color: #fff;
  width: 50%;
  text-align: right;
  padding: 50px 100px 50px 0;
  box-sizing: border-box;
  h1 {
    font-size: 5rem;
    white-space: nowrap;
  }
  .word-pinyin {
    margin-top: 25px;
  }
}

#quiz-wrapper {
  box-sizing: border-box;
  width: 50%;
  position: relative;
}

#quiz {
  border-radius: 6px;
  box-shadow: 0 8px 20px 0 rgba(0, 0, 0, 0.15);
}

#quiz-header {
  background: rgba(0, 0, 0, 0.4);
  padding: 20px 20px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.4);
  p {
    color: #fff;
  }
}

#quiz-options {
  .options-item {
    padding: 15px 20px;
    cursor: pointer;
    position: relative;
    color: #485160;
    line-height: 1.4rem;
    &.answered-wrong {
      color: #bc3939;
      span {
        display: block;
        animation: shake 0.4s 1;
      }
    }
    &.answered-correct {
      &:before {
        background-color: #e5f2e2;
      }
      color: #3a6830;
    }
    &:before {
      content: "";
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      position: absolute;
      background: #fff;
    }
    span {
      position: relative;
      z-index: 1;
    }
    &:hover {
      &:before {
        opacity: 0.95;
      }
    }
  }
  .options-item + .options-item {
    border-top: 1px solid #cfd9e8;
  }
  .options-item:last-child {
    &:before {
      border-bottom-right-radius: 6px;
      border-bottom-left-radius: 6px;
    }
  }
}

#next-word {
  margin-top: 40px;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  display: inline-block;
  padding: 10px 15px;
  border-radius: 10px;
  opacity: 0.3;
  right: 0;
  cursor: pointer;
  position: absolute;
  &:hover {
    opacity: 0.8;
  }
}
</style>