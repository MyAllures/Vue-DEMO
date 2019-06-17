
<template>
  <div class="skin__game-category">
    <el-row class="bet-area m-b-lg" v-if="game">
      <div class="title">{{game.display_name}}</div>
      <div class="tabs-wrapper">
        <div v-if="betTypeTabs.length > 1">
          <el-tabs v-model="activeBetTypeTab"
            class="bet-type-tabs"
            type="card">
            <el-tab-pane label="下注" :name="betTypeTabs[0]">
              <PlaceOrderArea
                :amount.sync="amount"
                :validPlays.sync="validPlays"
                :gameClosed="gameClosed"
                @clearShortCut="clearShortCut"
                @togglePlayReset="togglePlayReset"
                @openBetDialog="openBetDialog">
              </PlaceOrderArea>
              <PlaceBetArea
                :betType="betTypeTabs[0]"
                @getValidPlays="getValidPlays"
                :playReset="playReset"
                :playSections="playSections"
                :game="game"
                :gameClosed="gameClosed"
                :currentCategory="currentCategory"
                :aliases="aliases"
                :amount="amount"
                :currentAlias="currentAlias"
                ref="placeBetArea"
                :zodiacMap="zodiacMap">
              </PlaceBetArea>
            </el-tab-pane>
            <el-tab-pane label="追号" :name="betTypeTabs[1]">
              <PlaceBetArea
                :betType="betTypeTabs[1]"
                @getValidPlays="getValidPlays"
                :playReset="playReset"
                :trackbetOptions.sync="trackbetOptions"
                :playSections="playSections"
                :game="game"
                :gameClosed="gameClosed"
                :currentCategory="currentCategory"
                :aliases="aliases"
                :amount="amount"
                :zodiacMap="zodiacMap">
              </PlaceBetArea>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-else>
          <PlaceOrderArea
            :amount.sync="amount"
            :validPlays.sync="validPlays"
            :gameClosed="gameClosed"
            @clearShortCut="clearShortCut"
            @togglePlayReset="togglePlayReset"
            @openBetDialog="openBetDialog">
          </PlaceOrderArea>
          <PlaceBetArea
            :isInTabs="false"
            :betType="betTypeTabs[0]"
            @getValidPlays="getValidPlays"
            :playReset="playReset"
            :playSections="playSections"
            :game="game"
            :gameClosed="gameClosed"
            :currentCategory="currentCategory"
            :aliases="aliases"
            :amount="amount"
            :currentAlias="currentAlias"
            ref="placeBetArea"
            :zodiacMap="zodiacMap">
          </PlaceBetArea>
        </div>

        <div class="planbutton-wrapper" v-if="planSiteButtonVisible">
          <PlanSiteBtn :gameCode="game.code"></PlanSiteBtn>
        </div>
      </div>
      <PlaceOrderArea
        :amount.sync="amount"
        :validPlays.sync="validPlays"
        :gameClosed="gameClosed"
        @clearShortCut="clearShortCut"
        @togglePlayReset="togglePlayReset"
        @openBetDialog="openBetDialog">
      </PlaceOrderArea>
    </el-row>
    <el-dialog title="确认注单"
      width="45%"
      @close="beforeClose"
      :visible.sync="betDialog.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body>
      <section v-if="!isPlayingBetTrack">
        <el-table :data="betDialog[this.betTypeTabs[0]].plays" stripe max-height="350">
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
              <el-input size="mini" v-model="scope.row.bet_amount"
                type="text"
                @keypress.native="handleAmountKeypress($event)"
                @input="inputBetDialogPlaysPlayAmount(scope.row.bet_amount, scope.row.id)"
                @change="inputBetDialogPlaysPlayAmount(scope.row.bet_amount, scope.row.id)"></el-input>
            </template>
          </el-table-column>
          <el-table-column property="active" label="确认" width="100">
            <template slot-scope="scope">
              <el-checkbox v-model="scope.row.active">确认</el-checkbox>
            </template>
          </el-table-column>
        </el-table>
        <div class="summary text-center p-t p-b">
          共 {{ betDialog[this.betTypeTabs[0]].plays.length && betDialog[this.betTypeTabs[0]].plays[0].isCustom ? betDialog[this.betTypeTabs[0]].plays[0].combinations.length : playsForSubmit.bets.length}} 组 总金额:
          <span class="red bet-amount text-bold">{{betDialog[this.betTypeTabs[0]].totalAmount | currency('', 1)}}</span>
        </div>
        <div class="text-center m-t" v-if="user.account_type&&isChatroomEnabled">
          <el-checkbox v-model="followBetAllowed">分享注单允许其他玩家跟投</el-checkbox>
        </div>
      </section>

      <section v-else>
        <el-table :data="betDialog[this.betTypeTabs[1]].plays" stripe max-height="550">
          <el-table-column property="display_name" label="内容">
            <template slot-scope="scope">
              {{scope.row.display_name}}
              <span v-if="validPlays[0].combinations">共{{validPlays[0].combinations.length}}組</span>
              <p class="track-options" v-if="scope.row.betOptions && scope.row.betOptions.options">
                已选号码：<span class="option" v-for="(option, index) in scope.row.betOptions.options" :key="index">
                  {{option}}
                </span>
              </p>
            </template>
          </el-table-column>
          <el-table-column property="odds" label="赔率" width="100">
            <template slot-scope="scope">
              <span class="red">{{scope.row.odds}}</span>
            </template>
          </el-table-column>
          <el-table-column property="bet_amount" label="金额" width="120">
            <template slot-scope="scope">
              <el-input size="mini" v-model="scope.row.bet_amount"
                type="text"
                @keypress.native="handleAmountKeypress($event)"
                @input="inputBetDialogPlaysPlayAmount(scope.row.bet_amount, scope.row.id); handleTrackConfirmationInput('bet_amount')"
                @change="inputBetDialogPlaysPlayAmount(scope.row.bet_amount, scope.row.id)"></el-input>
            </template>
          </el-table-column>
          <el-table-column property="type" label="追号期数" width="120">
            <template slot-scope="scope">
              <el-input @input="handleTrackConfirmationInput('type')"
                type="text"
                @keypress.native="handleIntergerInputKeypress($event)"
                @blur="handleConfirmationInputBlur($event, 1, 'type')"
                v-model="scope.row.type"></el-input>
            </template>
          </el-table-column>
          <el-table-column property="multiple" label="翻倍" width="120">
            <template slot-scope="scope">
              <el-input @input="handleTrackConfirmationInput('multiple')"
                type="text"
                @keypress.native="handleIntergerInputKeypress($event)"
                @blur="handleConfirmationInputBlur($event, 1, 'multiple')"
                v-model="scope.row.multiple"></el-input>
            </template>
          </el-table-column>
        </el-table>
        <section class="prediction-schedule-container">
          <table class="table">
            <thead class="thead">
              <tr class="tr">
                <td class="td" width="150">期号</td>
                <td class="td">投注金额</td>
              </tr>
            </thead>
            <tbody class="tbody">
              <tr class="tr" v-for="(s, index) in betDialog[this.betTypeTabs[1]].predictionSchedules" :key="index">
                <td class="td" width="150">{{s.issue}}</td>
                <td class="td">{{s.amount}}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <div class="text-center m-t-lg">
          <el-checkbox v-model="trackbetOptions.stopping_tracking_type"
            :true-label="'when_win_stop'"
            :false-label="'never_stop'">
            中奖后停止追号
          </el-checkbox>
        </div>
      </section>
      <div class="text-center m-t-lg" v-if="!submitted">
        <el-alert class="m-b" v-if="errors" :title="errors" type="error" center :closable="false" show-icon></el-alert>
        <el-button size="medium" :loading="submitting" type="primary" :disabled="submitBtnDisabled" @click="placeOrder">确认</el-button>
        <el-button size="medium" @click="betDialog.visible = false" :disabled="submitting">取消</el-button>
      </div>
      <el-alert v-else title="成功下单" type="success" center :closable="false" show-icon></el-alert>
    </el-dialog>
  </div>
</template>


<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import _ from 'lodash'
import { placeBet, fetchMoreSchedule, sendBetTrackV2 } from '@/api'
import { msgFormatter, formatPlayGroup } from '@/utils'
import { colorWave, tailMap } from '@/utils/hk6'
import { validateAmount } from '@/validate'
import config from '@/config'
import PlaceOrderArea from '@/components/Bet/PlaceOrderArea'
import PlaceBetArea from '@/components/Bet/PlaceBetArea'
import PlanSiteBtn from '@/components/PlanSiteBtn'

export default {
  props: {
    gameClosed: {
      type: Boolean,
      default: false
    },
    scheduleId: {
      type: Number
    },
    game: {
      type: Object
    },
    zodiacMap: {
      type: Object
    }
  },
  name: 'gameCategory',
  components: {
    PlaceOrderArea,
    PlaceBetArea,
    PlanSiteBtn
  },
  data () {
    const betTypeTabs = ['normalbet', 'trackbet']
    return {
      customPlayGroups: config.customPlayGroups,
      amount: localStorage.getItem('amount') || '50',
      submitted: false,
      submitting: false,
      errors: '',
      playReset: false,
      showCombinationDetails: false,
      followBetAllowed: true,
      followingBets: [],
      aliases: [[]],
      validPlays: [],
      betDialog: {
        visible: false,
        'normalbet': {
          totalAmount: 0,
          plays: []
        },
        'trackbet': {
          plays: [],
          predictionSchedules: []
        }
      },
      betTypeTabs,
      activeBetTypeTab: betTypeTabs[0],
      trackbetOptions: {
        multiple: 1,
        type: 1,
        bet_amount: 10,
        stopping_tracking_type: 'when_win_stop',
        game_schedule: null,
        betOption: {
          options: []
        }
      },
      confirmingSchedulesLoading: false
    }
  },
  computed: {
    ...mapState([
      'user',
      'systemConfig',
      'chatRoom',
      'playGroups'
    ]),
    ...mapState('chatroom', {
      isChatroomEnabled: state => state.roomList.length > 0
    }),
    planSiteButtonVisible () {
      const enabled = (config.expertPlan.default === config.expertPlan.old)
      return !!(enabled && this.game.code)
    },
    hasTrackBet () {
      if (!this.game) {
        return false
      }
      return config.trackbet.games.includes(this.game.code)
    },
    isPlayingBetTrack () {
      return this.activeBetTypeTab === this.betTypeTabs[1]
    },
    submitBtnDisabled () {
      if (this.isPlayingBetTrack) {
        if (this.betDialog[this.betTypeTabs[1]].plays.length) {
          return this.betDialog[this.betTypeTabs[1]].plays[0].bet_amount > this.user.balance
        }
      } else {
        let bettingArr = this.playsForSubmit.bets || this.playsForSubmit
        let sufficientBalance = this.betDialog[this.betTypeTabs[0]].totalAmount > this.user.balance
        return !bettingArr.length || sufficientBalance
      }
    },
    playsForSubmit () {
      let bettingArr = _.filter(this.betDialog[this.betTypeTabs[0]].plays, play => play.active && parseFloat(play.bet_amount) > 0).map(play => {
        return {
          game_schedule: this.scheduleId,
          bet_amount: parseFloat(play.bet_amount),
          play: play.id,
          bet_options: play.bet_options
        }
      })
      if (this.followBetAllowed && this.user.account_type) {
        return {
          bets: bettingArr,
          share_bet_info: true
        }
      } else {
        return {
          bets: bettingArr,
          share_bet_info: false
        }
      }
    },
    formattedCombinations () {
      let formattedDetails = {}
      let plays = this.betDialog[this.betTypeTabs[this.isPlayingBetTrack ? 1 : 0]].plays
      _.each(plays, (activePlay) => {
        _.each(Object.keys(this.plays[activePlay.id].combinations), (key) => {
          formattedDetails[key] = this.plays[activePlay.id].combinations[key]
        })
      })
      return formattedDetails
    },
    currentAlias () {
      for (const section of this.aliases) {
        for (const group of section) {
          if (group && group.active) {
            return group.name
          }
        }
      }
      return null
    },
    currentCategory () {
      const categories = this.$store.state.categories[this.$route.params.gameId]
      if (!categories) {
        return null
      } else {
        return categories.find(category => category.id + '' === this.$route.params.categoryId)
      }
    },
    currentPlayGroups () {
      return this.playGroups[this.$route.params.categoryId]
    },
    playSections () {
      let formatting = this.currentCategory ? this.currentCategory.formatting : []
      if (this.currentPlayGroups && this.currentPlayGroups.length && formatting.length) {
        let copyPlayGroups = _.cloneDeep(this.currentPlayGroups)
        copyPlayGroups.forEach(item => {
          item.plays.forEach(play => {
            if (item.code.endsWith('pg_clrwvs_color')) {
              play['value'] = colorWave[play.code]
            } else if (item.code.endsWith('pg_pxxmtail')) {
              play['value'] = tailMap[play.display_name]
            }
          })
        })
        return formatPlayGroup(copyPlayGroups, formatting)
      } else {
        return []
      }
    }
  },
  watch: {
    'hasTrackBet': {
      handler (bool) {
        if (!bool) {
          this.betTypeTabs = ['normalbet']
          this.activeBetTypeTab = 'normalbet'
        }
      },
      immediate: true
    },
    'isPlayingBetTrack': {
      handler (bool) {
        this.trackbetOptions = {
          multiple: 1,
          type: 1,
          bet_amount: 10,
          stopping_tracking_type: 'when_win_stop',
          game_schedule: null,
          betOption: {
            options: []
          }
        }
        this.reset()
        this.$emit('isPlayingBetTrack', bool)
      },
      immediate: true
    },
    'playsForSubmit': {
      handler: function () {
        let plays = this.betDialog[this.betTypeTabs[0]].plays
        if (plays.length && plays[0].isCustom) {
          this.betDialog[this.betTypeTabs[0]].totalAmount = plays[0].bet_amount * plays[0].combinations.length
        } else {
          this.betDialog[this.betTypeTabs[0]].totalAmount = _.reduce(this.playsForSubmit.bets, (sum, play) => { return sum + parseFloat(play.bet_amount) }, 0)
        }
      },
      deep: true
    },
    'betDialog.plays': {
      handler: function () {
        _.each(this.betDialog[this.betTypeTabs[0]].plays, (play) => {
          if (!parseFloat(play.bet_amount)) {
            play.active = false
          }
        })
      },
      deep: true
    },
    'playSections': {
      immediate: true,
      handler (playSections) {
        if (playSections && playSections.length) {
          this.aliases = _.map(playSections, section => {
            return _.map(section.playgroups, (playgroup, index) => {
              if (playgroup.alias) {
                return {
                  name: playgroup.alias,
                  active: index === 0
                }
              } else {
                return undefined
              }
            })
          })
        }
      }
    }
  },
  created () {
    // GA
    if (this.game && this.currentCategory) {
      let data = {
        gameName: this.game.display_name,
        categoryName: this.currentCategory.display_name
      }
      this.sendGaConfig(data)
    } else {
      const unwatch = this.$watch(vm => [vm.game, vm.currentCategory], result => {
        if (result[0] && result[1]) {
          let data = {
            gameName: result[0].display_name,
            categoryName: result[1].display_name
          }
          this.sendGaConfig(data)
          unwatch()
        }
      })
    }

    let categoryId = this.$route.params.categoryId
    if (!this.playGroups[categoryId]) {
      this.$store.dispatch('fetchPlayGroups', categoryId)
    }

    this.$root.bus.$on('openBetDialog', (gameData) => {
      this.openBetDialog()
    })

    this.$root.bus.$on('followBet', (bets) => {
      this.followingBets = bets
      this.$nextTick(() => {
        this.betDialog[this.betTypeTabs[0]].plays = this.followingBets.map((bet) => {
          let combos = bet.bet_options.opts_combos_count || 0
          let isCustom = combos > 1
          return {
            game_schedule: 10,
            display_name: `${bet.play.display_name ? bet.play.display_name + '-' : ''}${bet.play.playgroup}`,
            odds: bet.play.odds,
            bet_amount: isCustom ? (bet.bet_amount / combos) : bet.bet_amount,
            id: bet.play.id,
            bet_options: bet.bet_options,
            active: true,
            isCustom,
            combinations: new Array(combos),
            optionDisplayNames: bet.bet_options.options ? bet.bet_options.options.join(',') : ''
          }
        })
      })

      this.openBetDialog()
    })
  },
  methods: {
    triggerShortcut (group) {
      if (!this.amount) {
        this.reset()
        return
      }
      this.$refs['placeBetArea'].triggerShortcut(group)
    },
    handleTrackConfirmationInput (key) {
      const calculate = () => {
        const predictionSchedules = this.betDialog[this.betTypeTabs[1]].predictionSchedules
        const plays = this.betDialog[this.betTypeTabs[1]].plays
        _.each(predictionSchedules, (s, i) => {
          s.amount = plays[0].bet_amount * Math.pow(plays[0].multiple, i)
          if (String(s.amount).includes('e')) {
            s.amount = '金额过高 无法估算'
          }
        })
      }

      if (key === 'type') {
        this.fetchMoreSchedule(this.betDialog[this.betTypeTabs[1]].plays[0].type).then(() => {
          calculate()
        })
      } else {
        calculate()
      }
    },
    handleConfirmationInputBlur (evt, defaultValue, key) {
      let value = parseInt(evt.target.value)
      if (Number.isInteger(value)) {
        if (value > 30) {
          value = 30
        }
        if (value === 0) {
          value = 1
        }
      } else {
        value = defaultValue
      }
      this.betDialog[this.betTypeTabs[1]].plays[0][key] = value
    },
    fetchMoreSchedule: _.debounce(function (type) {
      this.confirmingSchedulesLoading = true
      return fetchMoreSchedule({
        gameId: this.game.id,
        gameCode: this.game.code,
        scheduleId: this.scheduleId,
        type: type || this.trackbetOptions.type
      }).then(schedules => {
        const plays = this.betDialog[this.betTypeTabs[1]].plays
        this.betDialog[this.betTypeTabs[1]].predictionSchedules = _.map(schedules, (s, i) => {
          let amount = plays[0].bet_amount * Math.pow(plays[0].multiple, i)
          if (String(amount).includes('e')) {
            s.amount = '金额过高'
          }
          return {
            issue: s.issue_number,
            amount: amount
          }
        })
      }).catch(() => {

      }).finally(() => {
        this.confirmingSchedulesLoading = false
      })
    }, 1000),
    getValidPlays (validPlays) {
      this.validPlays = validPlays
    },
    sendGaConfig (data) {
      const gaTrackingId = this.$store.state.systemConfig.gaTrackingId
      if (gaTrackingId) {
        window.gtag('config', gaTrackingId, {page_path: this.$route.path, page_title: `${data.gameName} - ${data.categoryName}`})
      }
    },
    handleAmountKeypress (evt) {
      let reg = /(\d)|(\.)/
      if (!reg.test(evt.key)) {
        evt.preventDefault()
      }
    },
    handleIntergerInputKeypress (evt) {
      if (!/^\d+$/.test(evt.key)) {
        evt.preventDefault()
      }
    },
    inputBetDialogPlaysPlayAmount (iptVal, id) {
      let play
      if (this.isPlayingBetTrack) {
        play = this.betDialog[this.betTypeTabs[1]].plays.find(play => play.id === id)
      } else {
        play = this.betDialog[this.betTypeTabs[0]].plays.find(play => play.id === id)
      }

      if (!iptVal) {
        this.$nextTick(() => {
          play.bet_amount = ''
        })
      }
      if (iptVal && !validateAmount(iptVal)) {
        this.$nextTick(() => {
          if ((iptVal.indexOf('.') !== -1) && iptVal.length === 2) {
            play.bet_amount = `0${iptVal}`
          } else {
            let result = iptVal.slice(0, -1)
            if (result.split('.').length > 2) {
              result = '0.1'
            }
            play.bet_amount = result
          }
        })
      }
    },
    clearShortCut () {
      this.$emit('clearShortCut')
    },
    togglePlayReset () {
      Vue.set(this, 'playReset', !this.playReset)
    },
    beforeClose () {
      if (this.submitting) {
        return
      }
      this.errors = ''
      this.submitted = false
      this.followingBets = []
    },
    placeOrder () {
      if (this.submitting) {
        return
      }
      if (this.isPlayingBetTrack) {
        this.submitting = true
        this.errors = ''
        let play = this.betDialog['trackbet'].plays[0]
        let submitData = {}

        submitData.bet_amount = parseFloat(play.bet_amount)
        submitData.play_ids = play.id
        submitData.multiple = play.multiple
        submitData.odds = play.odds
        submitData.stopping_tracking_type = this.trackbetOptions.stopping_tracking_type
        submitData.type = play.type
        submitData.game_schedule = play.game_schedule

        if (play.betOptions) {
          submitData.betOptions = play.betOptions
        }
        sendBetTrackV2(submitData).then((res) => {
          this.submitted = true
          setTimeout(() => {
            this.submitted = false
            this.betDialog.visible = false
          }, 1000)
        }, errRes => {
          this.errors = msgFormatter(errRes)

          setTimeout(() => {
            this.betDialog.visible = false
          }, this.errors && this.errors.length > 20 ? 5000 : 3000)
        }).finally(() => {
          this.submitting = false
        })
        return
      }
      this.submitting = true
      this.errors = ''
      placeBet(this.playsForSubmit).then(res => {
        this.sendGaEvent({action: '投注', category: '遊戲投注', label: this.game.display_name})
        this.submitting = false
        if (res && res[0].member) {
          this.submitted = true
          setTimeout(() => {
            this.submitted = false
            this.betDialog.visible = false
            if (!this.followingBets.length) {
              this.reset()
            }
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
          this.betDialog.visible = false
        }, this.errors && this.errors.length > 20 ? 5000 : 3000)
      })
    },
    openBetDialog () {
      if (this.isPlayingBetTrack) {
        this.trackbetOptions.game_schedule = this.scheduleId
        this.trackbetOptions.play_ids = this.validPlays[0].id
        this.trackbetOptions.bet_amount = this.validPlays[0].amount
        this.fetchMoreSchedule()
        this.betDialog[this.betTypeTabs[1]].plays = [{
          display_name: this.validPlays[0].group + ' - ' + this.validPlays[0].display_name,
          odds: this.validPlays[0].odds,
          bet_amount: this.validPlays[0].amount,
          id: this.validPlays[0].id,
          type: this.trackbetOptions.type,
          multiple: this.trackbetOptions.multiple,
          stopping_tracking_type: this.trackbetOptions.stopping_tracking_type,
          game_schedule: this.scheduleId
        }]

        let play = this.validPlays[0]

        if (play.combinations && play.combinations.length) {
          let betOptions
          if (play.selectedOptions) {
            let options = []
            _.each(play.selectedOptions, option => {
              options.push(option.num)
            })
            betOptions = { options: options }
          } else if (play.combinations) {
            betOptions = { options: play.combinations }
          } else {
            betOptions = {}
          }
          this.betDialog[this.betTypeTabs[1]].plays[0].betOptions = betOptions
        }
        this.betDialog.visible = true
        return
      }

      this.betDialog[this.betTypeTabs[0]].plays = _.values(this.validPlays.map(play => {
        let betOptions
        let isCustom = play.isCustom
        let optionDisplayNames = []
        if (play.selectedOptions) {
          let options = []
          _.each(play.selectedOptions, option => {
            options.push(option.num)
            optionDisplayNames.push(option.displayName || option.num)
          })
          betOptions = { options: options }
        } else if (play.combinations) {
          isCustom = false
          betOptions = { options: play.combinations }
          optionDisplayNames = [...play.combinations]
        } else {
          betOptions = {}
        }
        if (optionDisplayNames.length > 0) {
          optionDisplayNames = optionDisplayNames.join(',')
        } else {
          optionDisplayNames = ''
        }

        let forShow = ''

        if (play.hideName) {
          forShow = play.group
        } else {
          if (play.alias) {
            if (play.alias === play.display_name) {
              forShow = `${play.group} - ${play.alias}`
            } else {
              forShow = `${play.alias} - ${play.display_name}`
            }
          } else {
            forShow = `${play.group} - ${play.display_name}`
          }
        }

        return {
          game_schedule: 10,
          display_name: forShow,
          odds: play.odds,
          bet_amount: play.amount,
          id: play.id,
          bet_options: betOptions,
          active: true,
          isCustom,
          combinations: play.combinations,
          optionDisplayNames: optionDisplayNames
        }
      }))

      this.betDialog.visible = true
    },
    reset () {
      this.togglePlayReset()
      this.clearShortCut()
    }
  }
}
</script>

<style scoped lang='scss'>
@import "../../style/gameplay.scss";

.title {
  font-size: 14px;
  color: #333;
  height: 32px;
  line-height: 32px;
  margin-bottom: 15px;
}

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

.el-input /deep/ .el-input__inner{
  height: 30px;
  border: solid 1px #c8c8c8;
}

.bet-type-tabs {
  &/deep/ {
    .el-tabs__content {
      padding-bottom: 0;
      margin-bottom: 20px;
    }
    .el-tabs__header.is-top {
      margin-bottom: 0;
      padding-left: 20px;
      .el-tabs__nav-scroll {
        padding-left: 0;
      }
    }
  }
}

.prediction-schedule-container {
  background-color: #f3f4f5;
  .table {
    width: 100%;
  }
  .thead {
    display: inline-block;
    font-size: 12px;
    color: #999;
    border-bottom: 1px solid #eee;
    .tr {
      height: 35px;
    }
  }

  .tbody {
    width: 100%;
    display: inline-block;
    height: 250px;
    overflow-y: auto;
    .tr {
      height: 25px;
    }
    .td {
      font-size: 12px;
      color: #333;
    }
  }

  .td {
    vertical-align: middle;
    padding-left: 20px;
  }
}
.track-options {
  font-weight: 700;
  .option {
    &:not(:last-child)::after {
      content: ', ',
    }
  }
}

.tabs-wrapper {
  position: relative;
}

.planbutton-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  height: 40px;
  line-height: 40px;
}
</style>

