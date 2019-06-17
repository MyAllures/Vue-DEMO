<template>
  <div class="gamehall">
    <GameMenu class="game-menu" :addition="addition"/>
    <!-- user key props to force Vue to re-render router-view whenever route change -->
    <div class="content">
      <router-view :key="$route.params.gameId" :class="{'fix-height': hasChatroom}" ref="game-area"/>
      <chatroom v-if="hasChatroom" class="chatroom"/>
    </div>
    <el-dialog
      :title="'余额不足'"
      :visible="balanceDialog.visible"
      width="380px"
      custom-class="insufficient-dialog"
      @close="$store.dispatch('hideBalanceDialog')"
      append-to-body>
      <div class="wrapper">
        <div class="figure">
          <img class="img" src="../assets/icon_balance_empty.jpg" alt="balance">
        </div>
        <div class="figure-caption">
          <p>亲，余额不足呢！</p>
          <p>余额仅剩 {{user.balance | currency('￥')}} 元,</p>
          <p>不足投注 {{balanceDialog.totalAmount | currency('￥')}} 元,</p>
          <p>预估可赢 {{balanceDialog.expectedWinAmount | currency('￥')}} 元,</p>
          <p>赶紧去 呗！</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click.native="goToPay">去 </el-button>
          <el-button @click.native="$store.dispatch('hideBalanceDialog')">返回修改</el-button>
        </div>
    </el-dialog>
    <bet-dialog :visible.sync="betDialogVisible" :betInfo="betInfo"/>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import GameMenu from '@/components/GameMenu'
import '../style/resultsball.scss'
import { hasExpertPlan } from '@/utils/expertPlanSetting'
import { find } from 'lodash'
import Chatroom from '@/components/chatroom/index'
import BetDialog from '@/components/Bet/BetDialog'
import config from '@/config'
let bus = new Vue()

export default {
  name: 'Gamehall',
  componentName: 'Gamehall',
  components: {
    GameMenu,
    Chatroom,
    BetDialog
  },
  filters: {
    betOptionFilter (options) {
      if (options) {
        return options.join(', ')
      } else {
        return ''
      }
    }
  },
  data () {
    return {
      betrecords: [],
      scheduleId: null,
      betInfo: {},
      betDialogVisible: false,
      hasChatroom: false
    }
  },
  computed: {
    ...mapGetters([
      'user', 'allGames'
    ]),
    ...mapState([
      'isChatting', 'balanceDialog'
    ]),
    ...mapState('chatroom', {
      isChatting: state => state.isChatting,
      isChatroomEnabled: state => state.roomList.length > 0
    }),
    currentGame () {
      return find(this.allGames, game => game.id + '' === this.$route.params.gameId)
    },
    addition () {
      const addition = []
      if (!this.currentGame) {
        return []
      }
      const enabled = (config.expertPlan.default === config.expertPlan.new)
      if (enabled && hasExpertPlan(this.currentGame.code)) {
        addition.push('expertplan')
      }
      return addition
    }
  },
  watch: {
    '$route': function (to, from) {
      if (to.params.gameId !== from.params.gameId) {
        this.betrecords = []
      }
      if (to.path === '/game') {
        this.chooseGame()
      }
    },
    'isChatroomEnabled': {
      handler: function (enabled) {
        if (enabled) {
          this.hasChatroom = true
        }
      },
      immediate: true
    }
  },
  created () {
    if (!this.$route.params.gameId) {
      if (this.allGames.length > 0) {
        this.chooseGame()
      } else {
        const unwatch = this.$watch('allGames', function (allGames) {
          this.chooseGame()
          unwatch()
        })
      }
    }

    this.$root.bus = bus
    window.addEventListener('keypress', this.keyEnterListener)
    this.$on('openBetDialog', (betInfo) => {
      this.betInfo = betInfo
      this.betDialogVisible = true
    })
  },
  methods: {
    chooseGame () {
      const gameId = this.$store.state.lastGameData.lastGame || this.allGames[0].id
      this.$router.replace('/game/' + gameId)
    },
    goToPay () {
      this.$store.dispatch('hideBalanceDialog')
      this.sendGaEvent({
        action: ' 提示',
        category: '遊戲大廳 ',
        label: '餘額不足'
      })
      this.$router.push('/account/remit')
    },
    keyEnterListener (event) {
      let area = this.$refs['game-area']
      if (!area || !area.$el.contains(event.target)) {
        return
      }
      if (event.keyCode === 13 && !this.isChatting && this.$route.query.service !== 'on') {
        this.$root.bus.$emit('openBetDialog')
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
    this.$root.bus.$off('followBet')
    window.removeEventListener('keypress', this.keyEnterListener)
  }
}
</script>

<style scoped lang="scss">
@import "../style/vars.scss";
.gamehall {
  .game-menu {
    position: relative;
    z-index: 200;
  }
  .content {
    position: relative;
    z-index: 100;
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    height: calc(100vh - 100px - 83px);
    margin: 0 auto;
    overflow-y: auto;
    .fix-height {
      height: 100%;
      overflow-y: auto;
    }
  }
}

.chatroom {
  box-sizing: border-box;
  height: 100%;
  width: 335px;
  margin-right: 65px;
  background: #eee;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.12);
}

.el-main {
  padding: 0;
}

.insufficient-dialog {
  .wrapper {
    display: inline-flex;
    align-items: center;
  }

  .figure {
    width: 120px;
    height: auto;
    .img {
      width: 100%;
      height: 100%;
    }
    &-caption {
      margin-left: 15px;
      line-height: 1.5;
    }
  }
}

</style>
