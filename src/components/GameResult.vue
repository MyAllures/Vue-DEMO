<template>
  <div class="result-balls" v-if="result">
    <div class="balls-text">
      <p class="game">{{result.display_name}}</p>
      <p class="issue">{{result.issue_number}}{{$t('navMenu.result_period')}}</p>
    </div>
    <AudioButton class="audio-button"/>
    <div class="invalid" v-if="result.status!=='valid'">
      官方开奖无效
    </div>
    <div :class="['balls-number', 'wrapper-' + result.game_code]" v-else-if="!result.loading">
      <span
        v-for="(option, index) in resultNums"
        :key="index"
        :class="option.class"
        :zodiac="option.zodiac">
        {{option.text}}
      </span>
    </div>
    <result-animation v-else :lastNums="lastNums"
      :gameCode="result.game_code"
      :resultNums="resultNums" />
  </div>
</template>

<script>
import AudioButton from '../components/AudioButton'
import ResultAnimation from '../components/ResultAnimation'

export default {
  props: {
    gameCode: {
      type: String
    }
  },
  data () {
    return {
      lastNums: []
    }
  },
  components: {
    AudioButton,
    ResultAnimation
  },
  watch: {
    gameCode () {
      this.lastNums = []
    },
    result () {
      this.lastNums = []
    }
  },
  computed: {
    resultNums () {
      if (!this.result.result_str) {
        return this.$t('navMenu.no_result')
      }
      let rawNums = this.result.result_str.split(',')
      let formattedNums = []
      const gameCode = this.result.game_code
      if (gameCode === 'bjkl8') {
        rawNums.pop()
      }
      if (gameCode === 'hkl' || gameCode === 'cshkl' || gameCode === 'luckl' || gameCode === 'cs600hkl' || gameCode === 'csjndhkl' || gameCode === 'cs75hkl') {
        rawNums.forEach((rawBall, index) => {
          if (rawBall[0] === '0' && rawBall !== '0') {
            rawBall = rawBall.slice(1)
          }
          formattedNums.push({class: `ball result-${gameCode} resultnum-${rawBall} zodiac`, zodiac: this.result.zodiac[index]})
          if (index === 5) {
            formattedNums.push({text: '＋', class: 'text'})
          }
          this.lastNums.push(rawBall)
        })
      } else if (gameCode === 'pcdd' || gameCode === 'jnd28' || gameCode === 'luckdd' || gameCode === 'msdd') {
        let sum = 0
        rawNums.forEach((rawBall, index) => {
          if (rawBall[0] === '0' && rawBall !== '0') {
            rawBall = rawBall.slice(1)
          }
          formattedNums.push({class: `ball result-${gameCode} resultnum-${rawBall}`})
          sum += Number(rawBall)
          this.lastNums.push(rawBall)
        })
        formattedNums.push({text: '总和', class: 'text'})
        this.lastNums.push('')

        formattedNums.push({class: `ball result-${gameCode} resultnum-${sum}`})
        this.lastNums.push(sum)
      } else {
        rawNums.forEach((rawBall) => {
          if (rawBall[0] === '0' && rawBall !== '0') {
            rawBall = rawBall.slice(1)
          }
          formattedNums.push({class: `ball result-${gameCode} resultnum-${rawBall}`})
          this.lastNums.push(rawBall)
        })
      }
      return formattedNums
    },
    result () {
      let result = this.$store.state.latestResultMap[this.gameCode]
      if (result && result.zodiac && typeof (result.zodiac) === 'string') {
        result.zodiac = result.zodiac.split(',')
      }
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/vars.scss";

.result-balls {
  display: table;
  max-width: 425px;
  height: 60px;
  margin-left: 20px;
  float: left;
  .balls-text {
    font-size: 13px;
    display: table-cell;
    vertical-align: middle;
    color: #666;
    text-align: center;
    p {
      width: 100px;
      height: 18px;
      line-height: 18px;
    }
    .issue {
      color: #999;
    }
  }
  .audio-button{
    display: table-cell;
    text-align: center;
    vertical-align: middle;
  }
  .balls-number {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    height: 100%;
    width: 100%;
    .ball {
      display: inline-block;
      margin-left: 5px;
      vertical-align: middle;
    }
    .text {
      vertical-align: middle;
      margin-left: 5px;
    }
    .zodiac {
      position: relative;
      &::before {
        position: absolute;
        content: attr(zodiac);
        top: 27px;
        left: 7px;
      }
    }
  }
  .ball-sum {
    display: inline-block;
  }
  .wrapper-hkl,.wrapper-luckl,.wrapper-cshkl, .wrapper-cs600hkl, .wrapper-csjndhkl, .wrapper-cs75hkl{
    padding-bottom: 10px;
  }
}

.invalid {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  font-size: 14px;
  letter-spacing: 1px;
  font-weight: bold;
  color: $watermelon;
}
</style>
