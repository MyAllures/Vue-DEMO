<template>
  <section>
    <el-row type="flex" class="m-b m-t" justify="center">
      <el-col :span="1" class="amount text-bold">金额</el-col>
      <el-col :span="3">
        <el-input v-model="tmpAmount"
          :min="1" :step="0.1"
          type="text"
          @keypress.native="handleAmountKeypress($event, tmpAmount)"
          @input="inputAmount(tmpAmount)"
          @change="inputAmount(tmpAmount)"/>
      </el-col>
      <el-col class="m-l-lg" :span="5">
        <el-button class="place-order-btn" type="primary" size="small" @click="handleBetClick" :disabled="gameClosed">下单</el-button>
        <el-button size="small" @click="reset">重置</el-button>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import _ from 'lodash'
import {validateAmount} from '@/validate'
import {mapState} from 'vuex'
export default {
  props: {
    gameClosed: {
      type: Boolean,
      default: false
    },
    amount: {
      type: String,
      default: localStorage.getItem('amount') || '50'
    },
    validPlays: {
      type: Array
    }
  },
  data () {
    return {
      tmpAmount: this.amount
    }
  },
  watch: {
    tmpAmount: {
      handler (amount) {
        localStorage.setItem('amount', amount)
        this.$emit('update:amount', amount)
      }
    }
  },
  methods: {
    inputAmount (iptVal) {
      if (!iptVal) {
        this.$nextTick(() => {
          this.tmpAmount = ''
        })
      }
      if (iptVal && !validateAmount(iptVal)) {
        this.$nextTick(() => {
          if ((iptVal.indexOf('.') !== -1) && iptVal.length === 2) { // handle the backspace
            this.tmpAmount = `${iptVal}`
          } else {
            let result = iptVal.slice(0, -1)
            if (result.split('.').length > 2) {
              result = '0.1'
            }
            this.tmpAmount = result
          }
        })
      }
    },
    handleAmountKeypress (evt) {
      let reg = /(\d)|(\.)/
      if (!reg.test(evt.key)) {
        evt.preventDefault()
      }
    },
    reset () {
      this.$emit('togglePlayReset')
      this.$emit('initActivePlays')
      this.$emit('clearShortCut')
    },
    handleBetClick () {
      // check balance is enough for this bet
      if (this.validPlays && this.validPlays.length) {
        // plays has combination has only one in the array, calculation is using its property - combination
        let combinationPlay = this.validPlays[0]
        let hasCombinations = combinationPlay.combinations && (combinationPlay.combinations.length > 1)
        // play for selection combination
        let totalAmount
        let expectedWinAmount
        if (hasCombinations) {
          if (this.validPlays.length > 1) {
            totalAmount = this.validPlays.length * parseFloat(this.validPlays[0].amount)
            expectedWinAmount = (parseFloat(combinationPlay.amount) * this.validPlays.length * combinationPlay.odds) - totalAmount
          } else {
            totalAmount = this.validPlays[0].combinations.length * parseFloat(this.validPlays[0].amount)
            expectedWinAmount = (parseFloat(combinationPlay.amount) * combinationPlay.combinations.length * combinationPlay.odds) - totalAmount
          }
        } else {
          totalAmount = _.reduce(this.validPlays, (sum, play) => {
            if (!play.amount) {
              return
            }
            return sum + parseFloat(play.amount)
          }, 0)
          expectedWinAmount = _.reduce(this.validPlays, (sum, play) => { return sum + (play.amount * play.odds) }, 0)
        }
        if (this.user.balance >= totalAmount) {
          this.$emit('update:validPlays', this.validPlays)
          this.$emit('openBetDialog')
        } else {
          if (totalAmount && expectedWinAmount) {
            this.$store.dispatch('showBalanceDialog', {
              totalAmount,
              expectedWinAmount
            })
          }
        }
      }
    }
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>

<style lang="scss" scoped>
@import "../../style/vars.scss";

.amount {
  line-height: $cell-height;
}
</style>
