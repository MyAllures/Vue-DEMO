<template>
  <div :class="['balls-number', 'wrapper-' + gameCode]">
    <div v-if="gameCode === 'jsk3' || gameCode === 'msk3' || gameCode === 'bjk3' || gameCode ==='gxk3' || gameCode ==='shk3' || gameCode ==='hubk3'" class="jsk3-loading">
      <div class="camera">
        <div class="space space1">
            <div class="dice dice1"></div>
            <div class="dice dice2"></div>
            <div class="dice dice3"></div>
            <div class="dice dice4"></div>
            <div class="dice dice5"></div>
            <div class="dice dice6"></div>
        </div>
      </div>
      <div class="camera">
        <div class="space space2">
            <div class="dice dice1"></div>
            <div class="dice dice2"></div>
            <div class="dice dice3"></div>
            <div class="dice dice4"></div>
            <div class="dice dice5"></div>
            <div class="dice dice6"></div>
        </div>
      </div>
      <div class="camera">
        <div class="space space3">
            <div class="dice dice1"></div>
            <div class="dice dice2"></div>
            <div class="dice dice3"></div>
            <div class="dice dice4"></div>
            <div class="dice dice5"></div>
            <div class="dice dice6"></div>
        </div>
      </div>
    </div>
    <template v-else>
      <div
        :class="chunk.text? 'text' : `result-${gameCode} view`"
        v-for="(chunk, chunkIndex) in resultChunks"
        :key="chunkIndex">
        {{chunk.text}}
        <ul v-if="!chunk.text"
          :style="getAnimateStyle(chunkIndex)"
          :class="`ul ${getAnimateClass(chunkIndex)}`">
          <li
            v-for="(num, index) in chunk"
            :key="index"
            :class="`result-${gameCode} resultnum-${num}`">
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
<script>
const GameOnlyChange = ['jspk10', 'bcr', 'mlaft', 'er75ft', 'jsk3', 'msnn', 'pk10nn', 'cs60cr']
const rand1to10 = ['jspk10', 'bcr', 'mlaft', 'er75ft', 'cs60cr', 'cs600cr']
const rand0to9 = ['jsssc', 'pcdd', 'tjssc', 'xjssc', 'cs5fc', 'cs10fc', 'cqssc', 'ynssc', 'hjssc', 'csffc', 'pcdd', 'jnd28', 'msdd']
const rand1to11 = ['gd11x5', 'ah11x5', 'bj11x5', 'fj11x5', 'gs11x5']
const rand1to20 = ['cqlf', 'gdklsf', 'hkl', 'luckl', 'cshkl', 'cs600hkl', 'csjndhkl', 'cs75hkl']
const rand1to49 = ['bjkl8', 'auluck8']

const randomGeneratorFactory = (gameCode) => {
  if (rand1to10.includes(gameCode)) {
    return () => Math.floor(Math.random() * 10 + 1)
  } else if (rand0to9.includes(gameCode)) {
    return () => Math.floor(Math.random() * 10)
  } else if (rand1to11.includes(gameCode)) {
    return () => Math.floor(Math.random() * 11 + 1)
  } else if (rand1to20.includes(gameCode)) {
    return () => Math.floor(Math.random() * 20 + 1)
  } else if (rand1to49.includes(gameCode)) {
    return () => Math.floor(Math.random() * 80 + 1)
  } else {
    return () => Math.floor(Math.random() * 6 + 1)
  }
}

export default {
  name: 'GameResultAnimate',
  props: {
    gameCode: {
      type: String
    },
    resultNums: {
      type: Array
    },
    lastNums: {
      type: Array
    }
  },
  computed: {
    resultChunks () {
      const randomGenerator = randomGeneratorFactory(this.gameCode)
      return this.resultNums.map((option, index) => {
        if (option.text) {
          return option
        }
        const arr = []
        for (let i = 0; i < 4; i++) {
          arr.push(randomGenerator())
        }

        arr.push(arr[0])
        arr[0] = this.lastNums[index]
        return arr
      })
    }
  },
  methods: {
    getAnimateClass (chunkIndex) {
      return GameOnlyChange.includes(this.gameCode) ? `step-${chunkIndex % 2 ? 'odd' : 'even'}` : 'scroll-animating'
    },
    getAnimateStyle (chunkIndex) {
      let animationDuration = ''
      const GAMES_HAS_SUM = ['pcdd', 'jnd28', 'luckdd', 'msdd']
      const getDuration = (speed = 1.5) => (chunkIndex + 1) / speed
      if (GAMES_HAS_SUM.includes(this.gameCode)) {
        animationDuration = `${(getDuration())}s`
      } else {
        animationDuration = `${getDuration((Math.random() * 5) + 3)}s`
      }

      return GameOnlyChange.includes(this.gameCode) ? `` : {animationDuration}
    }
  }
}
</script>

<style lang="scss" scoped>
.balls-number {
  display: table-cell;
  text-align: center;
  height: 100%;
  .text {
    display: inline;
    vertical-align: middle;
    margin-left: 5px;
  }
}

.wrapper-hkl,.wrapper-luckl,.wrapper-cshkl,.wrapper-cs600hkl,.wrapper-csjndhkl, .wrapper-cs75hkl {
  padding-bottom: 10px;
}

.view {
  position: relative;
  display: inline-block;
  margin-left: 5px;
  background: none;
  overflow: hidden;
  border-radius: 0;
  vertical-align: middle;

  .ul {
    position: absolute;
    top: 0;
    left: 0;
  }
  .scroll-animating {
    animation-name: scroll;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-iteration-count: 1;
    animation-direction: normal;
    will-change: transform;
  }
  .step-odd {
    width: 100%;
    animation: changeStep 1s step-start infinite normal;
  }
  .step-even {
    width: 100%;
    animation: changeStep 1s step-start infinite normal;
  }
}

.ball-sum {
  display: inline-block;
  font-size: 12px;
}


@keyframes scroll {
  0% {
    transform: translateY(-100%);
  }
  75% {
    transform: translateY(-30%);
  }
  95% {
    transform: translateY(2%);
  }
  100% {
    transform: translateY(0%);
  }
}

@keyframes changeStep {
  0% {
      transform: translateY(0);
  }
  25% {
      transform: translateY(-20%);
  }
  50% {
      transform: translateY(-40%);
  }
  75% {
      transform: translateY(-60%);
  }
  100% {
      transform: translateY(-80%);
  }
}
.jsk3-loading {
  display: flex;
  justify-content: center;
  height: 27px;
}
.camera{
    width: 27px;
    height: 27px;
    perspective-origin:center center;
    perspective:500px;
    &:nth-child(2){
      margin: 0 15px;
    }
}
.space{
    position:relative;
    width: 27px;
    height: 27px;
    transform-style:preserve-3d;
    transform-origin: 13px center -13px;
}
.space1 {
  animation:roll .2s linear .1s infinite;
}
.space2 {
  animation:roll2 .2s linear .2s infinite;
}
.space3 {
  animation:roll3 .2s linear .3s infinite;
}
.dice {
  position:absolute;
  top: 0;
  left: 0;
  width: 27px;
  height: 27px;
  background-size: 27px 162px;
  background-image: url("../assets/ball_4.png");
  background-repeat:  no-repeat;
}
.dice1{
    background-position: 0 0;
}
.dice2{
    background-position: 0 (-27px * 1);
    transform-origin:left top;
    transform:translateX(26px) rotateY(90deg);
}
.dice3{
    background-position: 0 (-27px * 2);
    transform:translateZ(-26px) rotateY(180deg);
}
.dice4{
    background-position: 0 (-27px * 3);
    transform-origin:right top;
    transform:translateX(-26px) rotateY(-90deg);
}
.dice5{
    background-position: 0 (-27px * 4);
    transform-origin:center bottom;
    transform:translateY(-26px) rotateX(90deg);
}
.dice6{
    background-position: 0 (-27px * 5);
    transform-origin:center top;
    transform:translateY(26px) rotateX(-90deg);
}

@keyframes roll{
    0%{
        transform:rotateY(0) rotateZ(30deg);
    }
    100%{
        transform:rotateY(-359.9deg) rotateZ(30deg);
    }
}
@keyframes roll2{
    0%{
        transform:rotateY(0) rotateZ(45deg);
    }
    100%{
        transform:rotateY(-359.9deg) rotateZ(45deg);
    }
}
@keyframes roll3{
    0%{
        transform:rotateY(0) rotateZ(60deg);
    }
    100%{
        transform:rotateY(-359.9deg) rotateZ(60deg);
    }
}
</style>
