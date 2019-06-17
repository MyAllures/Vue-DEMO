<template>
  <div :class="['bet-info-container',{self: isSelf}]" :style="{width}">
    <div class="bet-info-header">
      <div>
        <div class="game-name">{{info.display_name}}</div>
        <div class="issue-number">{{info.issue_number}}期</div>
      </div>
      <el-button
        v-if="!isSelf"
        mini
        type="primary"
        @click="openDialog">跟单</el-button>
    </div>
    <div class="bet-info-content">
      <ul class="bet-group">
        <li class="bet-group-item" v-for="(bet, index) in info.bets" :key="index">
          <div class="item">
            <div class="label">{{`${bet.play.playgroup} - ${bet.play.display_name}`}}</div>
            <div class="amount">{{bet.bet_amount|currency('￥')}}</div>
          </div>
          <div class="options" v-if="bet.bet_options&&bet.bet_options.options">
            {{`已选号码：${bet.bet_options.options.join(',')}`}}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import emitter from '@/mixins/emitter.js'

export default {
  name: 'ChatGameBetInfo',
  props: {
    info: Object,
    isSelf: Boolean
  },
  mixins: [emitter],
  data () {
    return {
      width: 335 * 0.7 + 'px'
    }
  },
  methods: {
    openDialog () {
      let bets = this.info.bets.map(bet => {
        let optionDisplayNames = []
        let betAmount = bet.bet_amount

        bet.bet_options = bet.bet_options || {
          opts_combos_count: ''
        }
        if (bet.bet_options.opts_combos_count) {
          betAmount = bet.bet_amount / bet.bet_options.opts_combos_count
        }
        if (bet.bet_options && bet.bet_options.options) {
          optionDisplayNames = bet.bet_options.options
        }
        return {
          game_schedule: bet.game_schedule,
          display_name: `${bet.play.playgroup} - ${bet.play.display_name}`,
          bet_amount: betAmount,
          play: bet.play.id,
          bet_options: bet.bet_options,
          odds: bet.play.odds,
          opts_combos_count: bet.bet_options.opts_combos_count,
          optionDisplayNames: optionDisplayNames.join(',')
        }
      })

      this.dispatch('Gamehall', 'openBetDialog', {
        bets
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.bet-info-container {
  font-size: 12px;
  width: 100%;
  color: #333;
  .bet-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 5px;
    .game-name {
      font-weight: 500;
    }
    .issue-number {
      color: #999;
    }

    /deep/ .weui-btn {
      height: 30px;
      margin: 0;
    }
  }
  .bet-info-content {
    width: 100%;
    border-top: 1px dashed;
    border-color: #ddd;
    padding-top: 2px;
    .bet-group-item {
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .options {
        padding-left: 10px;
      }
      .amount {
        flex: 0 0 auto;
        width: 60px;
      }
    }
  }
  &.self {
    color: #fff;
    .bet-info-header {
     .issue-number {
        color: rgba(255, 255, 255, 0.6);
      }
    }
    .bet-info-content {
      border-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>

