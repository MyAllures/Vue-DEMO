<template>
  <el-dialog title="确认注单"
    width="45%"
    @closed="afterClose"
    :visible="visible"
    @update:visible="updateDialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body>
    <section v-if="bets">
      <el-table :data="bets" stripe max-height="350">
        <el-table-column property="display_name" label="内容" >
          <template slot-scope="scope">
            <span class="p-l">{{scope.row.display_name}}</span>
            <span v-if="scope.row.isCustom" class="combinations-count">共 {{scope.row.combinations.length}} 组</span>
            <div v-if="scope.row.optionDisplayNames" class="text-bold p-l"> 已选号码：{{scope.row.optionDisplayNames}} </div>
            <div v-if="scope.row.isCustom && showCombinationDetails">
              <el-popover
                ref="popover4"
                placement="bottom"
                title="已选組合"
                trigger="hover">
                <div :style="{
                    'width': scope.row.combinations.length * 100 + '%',
                    'max-width' : '480px'
                    }">
                  <span
                    v-for="(detail, serial) in formattedCombinations" class="text-bold"
                    :key="serial">
                    <el-tag type="info">{{Number(serial)+1}}: {{detail}}</el-tag>
                  </span>
                </div>
              </el-popover>
              <el-button v-if="formattedCombinations && Object.keys(formattedCombinations).length" type="text" class="text-bold" v-popover:popover4>[查看明細]</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column property="odds" label="赔率" width="100">
          <template slot-scope="scope">
            <span class="red bet-amount text-bold">{{scope.row.odds}}</span>
          </template>
        </el-table-column>
        <el-table-column property="bet_amount" label="金额" width="150">
          <template slot-scope="scope">
            <amount-input  v-model="scope.row.bet_amount" />
          </template>
        </el-table-column>
        <el-table-column property="active" label="确认" width="100">
          <template slot-scope="scope">
            <el-checkbox v-model="scope.row.active">确认</el-checkbox>
          </template>
        </el-table-column>
      </el-table>
      <div class="summary text-center p-t p-b">
        共 {{ totalCount }} 组 总金额:
        <span class="red bet-amount text-bold">{{totalAmount | currency('', 1)}}</span>
      </div>
      <div class="text-center" v-if="betInfo.shared">
        <el-checkbox v-model="followBetAllowed">分享注单允许其他玩家跟投</el-checkbox>
      </div>
    </section>
    <div class="text-center m-t-lg" v-if="!submitted">
      <el-alert class="m-b" v-if="errors" :title="errors" type="error" center :closable="false" show-icon></el-alert>
      <el-button size="medium" :loading="submitting" type="primary" :disabled="submitBtnDisabled" @click="placeOrder">确认</el-button>
      <el-button size="medium" @click="$emit('update:visible', false)" :disabled="submitting">取消</el-button>
    </div>
    <el-alert v-else title="成功下单" type="success" center :closable="false" show-icon></el-alert>
  </el-dialog>
</template>
<script>
import { placeBet } from '@/api'
import { msgFormatter } from '@/utils'
import AmountInput from '@/components/AmountInput'

export default {
  name: 'BetDialog',
  props: {
    visible: Boolean,
    betInfo: Object
  },
  components: {
    AmountInput
  },
  data () {
    return {
      followBetAllowed: false,
      submitted: false,
      submitting: false,
      errors: '',
      bets: []
    }
  },
  computed: {
    submitBtnDisabled () {
      return false
    },
    totalCount () {
      const activeBets = this.bets.filter((bet) => bet.active === true)
      if (activeBets.length === 0) {
        return 0
      }
      let optsCombosCount = activeBets[0].opts_combos_count
      if (optsCombosCount && optsCombosCount > 1) {
        return optsCombosCount
      } else {
        return activeBets.length
      }
    },
    totalAmount () {
      const activeBets = this.bets.filter((bet) => bet.active === true)
      if (activeBets.length === 0) {
        return 0
      }
      let optsCombosCount = this.bets[0].opts_combos_count
      if (optsCombosCount && optsCombosCount > 1) {
        return activeBets[0].bet_amount * optsCombosCount
      } else {
        let total = 0
        activeBets.forEach(bet => {
          let num = parseFloat(bet.bet_amount)
          if (num) {
            total += num
          }
        })
        return total
      }
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    }
  },
  watch: {
    visible: function (visible) {
      if (visible) {
        this.bets = this.betInfo.bets.map(bet => { return {...bet, active: true, bet_amount: bet.bet_amount + ''} })
      }
    }
  },
  methods: {
    afterClose () {
      this.errors = ''
      this.bets = []
    },
    updateDialogVisible (visible) {
      this.$emit('update:visible', visible)
    },
    placeOrder () {
      if (this.submitting) {
        return
      }
      this.submitting = true
      this.errors = ''

      const formatBet = this.bets.filter((bet) => bet.active === true).map((bet, i) => {
        return {
          bet_options: bet.bet_options,
          game_schedule: bet.game_schedule,
          play: bet.play,
          bet_amount: parseFloat(bet.bet_amount)
        }
      })
      const betData = {bets: formatBet, share_bet_info: false}
      placeBet(betData).then(res => {
        this.sendGaEvent({action: '投注', category: '遊戲投注', label: this.currentGame.display_name})
        this.submitting = false
        if (res && res[0].member) {
          this.submitted = true
          setTimeout(() => {
            this.submitted = false
            this.$emit('update:visible', false)
          }, 1000)
        } else {
          let messages = []
          res.msg.forEach(error => {
            messages.push(error)
          })
          this.errors = messages.join(', ')
        }
      },
      errRes => {
        this.submitting = false
        this.errors = msgFormatter(errRes)
        setTimeout(() => {
          this.$emit('update:visible', false)
        }, this.errors && this.errors.length > 20 ? 5000 : 3000)
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.bet-amount {
  font-size: 14px;
}

.bet-area {
  background: #fff;
  padding: 10px;
}

.summary {
  font-size: 12px;
  padding: 5px;
  background: #f3f4f5;
}
</style>
