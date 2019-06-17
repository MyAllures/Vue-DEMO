<template>
  <div
    :class="['balls-number', 'wrapper-' + gameCode]"
    :style="{
      'width': gameCode === 'bjkl8' || gameCode === 'auluck8' ? '300px' : 'auto',
      'margin': '0 auto'
    }">
    <span
      v-for="(option, index) in results"
      :key="index"
      :class="option.class"
      :zodiac="option.zodiac">
      {{option.text}}
    </span>
  </div>
</template>

<script>
export default {
  props: {
    displayType: {
      type: String,
      default: 'number'
    },
    gameCode: {
      type: String
    },
    schedule: Array
  },
  computed: {
    resultNum () {
      const num = this.result.num
      if (num[0] === '0' && num !== '0') {
        return num.slice(1)
      }
      return num
    },
    rawNums () {
      return this.schedule.result_str.split(',')
    },
    classifyResults () {
      const category = this.schedule.result_category ? this.schedule.result_category : {}

      let classfied = this.rawNums.map((num, i) => ({
        oddEven: category[`ball_odd_even_${i + 1}`],
        thanSize: category[`ball_than_size_${i + 1}`],
        tailThanSize: category[`ball_tail_than_size_${i + 1}`],
        ballOfSumOddEven: category[`ball_of_sum_number_odd_even_${i + 1}`],
        ballOfSumThanSize: category[`ball_of_sum_number_than_size_${i + 1}`],
        zodiac: category[`ball_chinese_zodiac_${i + 1}`],
        num
      }))
      return classfied
    },
    results () {
      if (this.displayType !== 'number') {
        return this.classifyResults.map(result => {
          return {class: result[this.displayType]}
        })
      } else {
        let rawNums = this.rawNums
        let formattedNums = []
        const gameCode = this.gameCode
        if (gameCode === 'hkl' || gameCode === 'cshkl' || gameCode === 'luckl' || gameCode === 'cs600hkl' || gameCode === 'csjndhkl' || gameCode === 'cs75hkl') {
          rawNums.forEach((rawBall, index) => {
            if (rawBall[0] === '0' && rawBall !== '0') {
              rawBall = rawBall.slice(1)
            }
            formattedNums.push({class: `ball result-${gameCode} resultnum-${rawBall} zodiac`, zodiac: this.classifyResults[index].zodiac})
            if (index === 5) {
              formattedNums.push({text: '＋', class: 'text'})
            }
          })
        } else {
          rawNums.forEach((rawBall) => {
            if (rawBall[0] === '0' && rawBall !== '0') {
              rawBall = rawBall.slice(1)
            }
            formattedNums.push({class: `ball result-${gameCode} resultnum-${rawBall}`})
          })
        }
        return formattedNums
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@mixin number($w: 37px,$h: 37px) {
  background: url('../../assets/bjpknum2.png') no-repeat;
  display: inline-block;
  width: $w;
  height: $h;
  text-indent: -9999px;
  margin: 2px 5px;
}
.zodiac {
  display: block;
}
.odd {
  @include number;
  background-position: -150px -5px;
}
.even {
  @include number;
  background-position: -102px -5px;
}
.equal {
  @include number;
  background-position: -198px -4px;
}
.bigger {
  @include number;
  background-position: -12px -5px;
}
.smaller {
  @include number;
  background-position: -58px -5px;
}

.balls-number {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0 auto;
  padding: 10px 0;
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
      top: 20px;
      left: 7px;
    }
  }
}
.wrapper-hkl, .wrapper-luckl, .wrapper-cshkl, .wrapper-cs600hkl, .wrapper-csjndhkl, .wrapper-cs75hkl{
  padding-bottom: 20px;
}

</style>
