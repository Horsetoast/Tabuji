<template>
  <div id="wrapper" ref="wrapper" :style="{'backgroundColor': bgColor}">
    <IOdometer v-if="score != null" id="score" :value="score" :duration="500"/>
    <transition name="fade" appear mode="out-in">
      <div id="container" v-if="word && options.length" :key="word.trad">
        <div id="word">
          <h1>{{word.trad}}</h1>
          <p class="word-pinyin">{{word.pinyin}}</p>
        </div>
        <div id="quiz-wrapper">
          <div id="quiz">
            <div id="quiz-header">
              <transition name="fade" mode="out-in">
                <p v-if="status === states.WORD_READY" key="p1">Choose the correct meaning</p>
                <p v-else-if="status === states.ANSWERED_WRONG" key="p2">Nopes. Try again?</p>
                <p v-else-if="status === states.ANSWERED_CORRECT" key="p3">Correct!</p>
              </transition>
            </div>
            <ul id="quiz-options">
              <li
                v-for="(option, i) in options"
                :key="i"
                class="options-item"
                :class="{
            'answered-wrong': guessedOptions[i] && i !== correctOption,
            'answered-correct': guessedOptions[i] && i === correctOption
          }"
                @click="chooseAnswer(i)"
              >
                <span>{{ option }}</span>
              </li>
            </ul>
          </div>
          <div id="next-word" @click="createQuestion" v-show="status === states.ANSWERED_CORRECT">
            <span>Next word?</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  getRandomColor,
  getRandomWord,
  getRandomWordMeaning,
  makeWordQuestion,
  isDifferentDay,
  isValidDate
} from "../helpers.js";
import IOdometer from "vue-odometer";
import "odometer/themes/odometer-theme-default.css";

const states = {
  WORD_READY: "WORD_READY",
  ANSWERED_CORRECT: "ANSWERED_CORRECT",
  ANSWERED_WRONG: "ANSWERED_WRONG"
};

export default {
  components: {
    IOdometer
  },
  data() {
    return {
      states,
      status: states.WORD_READY,
      bgColor: null,
      score: null,
      word: {
        meanings: [],
        trad: null,
        simp: null,
        pinyin: null
      },
      options: [],
      correctOption: null,
      guessedOptions: {}
    };
  },
  created() {
    chrome.storage.sync.get(null, data => {
      const {
        score,
        lastScoreReset
      } = data;
      this.score = score;

      /**
      Reset score every day
      */
      const now = new Date();
      const lastDate = new Date(lastScoreReset);

      const isInvalidDate = typeof lastDate === "Invalid Date";
      if (isDifferentDay(lastDate, now) || isInvalidDate) {
        this.resetScore();
      }

      this.createQuestion();
    });
  },
  mounted() {
    setTimeout(() => this.initBackgroundTransition(), 100)
  },
  methods: {
    chooseAnswer(index) {
      if (this.status === states.ANSWERED_CORRECT) {
        return;
      }

      if (index === this.correctOption) {
        this.status = states.ANSWERED_CORRECT;
        this.updateScore();
      } else {
        this.status = states.ANSWERED_WRONG;
      }
      this.$set(this.guessedOptions, index, true);
    },
    createQuestion() {
      const word = getRandomWord();
      const data = makeWordQuestion(word);
      const color = getRandomColor();
      this.word = word;
      this.options = data.options;
      this.correctOption = data.correctOption;
      this.status = states.WORD_READY;
      this.guessedOptions = {};
      this.bgColor = color;
    },
    initBackgroundTransition() {
      const wrapper = this.$refs["wrapper"];
      if (wrapper && !wrapper.style["transition"]) {
        wrapper.style["transition"] = "background-color 1s ease-in";
      }
    },
    updateScore() {
      this.score += 1;
      chrome.storage.sync.set(
        {
          score: this.score
        }
      );
    },
    resetScore() {
      const lastScoreReset = new Date();
      this.score = 0;
      chrome.storage.sync.set(
        {
          score: 0,
          lastScoreReset: lastScoreReset.toString()
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
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes fade-out {
  0% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(10px);
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
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  position: absolute;
}

#score {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.3);
  display: block;
  padding: 0 16px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  color: #fff;
  font-weight: 500;
  border-radius: 25px;
  overflow: hidden;
  transition: all 0.5s;
  * {
    transition: all 0.5s;
  }
  &.odometer-animating {
    background: #68c752;
    transform: scale(1.1);
  }
}

#container {
  width: 50%;
  height: 100%;
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
