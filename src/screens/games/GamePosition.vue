<template>
  <div class="container skin__position">
    <div class="bet-area">
      <el-form class="bet-form" :model="bettrack" ref="bettrack" :rules="rules" label-width="72px">
        <el-form-item>
          <div slot="label" class="form-item-label">追号位置</div>
          <ul class="pos-group" v-if="bettrackPositions">
            <li
              :class="['pos-group-item', {active: pos.play_code_pattern === bettrack.play_code_pattern}]"
              v-for="pos in bettrackPositions.positions"
              :key="pos.id"
              @click="choosePos(pos)">{{pos.display_name}}</li>
          </ul>
        </el-form-item>
        <el-form-item>
          <div slot="label" class="form-item-label">追号期数</div>
          <el-radio-group v-model="bettrack.type">
            <el-radio :label="1">单期</el-radio>
            <el-radio :label="2">两期</el-radio>
            <el-radio :label="3">三期</el-radio>
          </el-radio-group>
          <div v-if="selectedSchedulesText" :class="['cur-issue-numbers', {fade: scheduleAnime}]">{{selectedSchedulesText}} 期</div>
        </el-form-item>
        <el-form-item prop="track_numbers" ref="track_numbers">
          <div slot="label" class="form-item-label">追号号码</div>
          <el-input v-model="trackNums"></el-input>
          <span class="hint m-l">多个号码用逗号分割，比如 1,2,3,4,5</span>
        </el-form-item>
        <el-form-item prop="bet_amount" ref="bet_amount">
          <div slot="label" class="form-item-label">单注金额</div>
          <el-input v-model="amount" prop></el-input>
          <span class="red m-l">注：中奖后停止追号</span>
        </el-form-item>
      </el-form>
      <el-button class="submit-btn" type="primary" size="medium" @click="submit">确认追号</el-button>
    </div>
    <div class="record-area">
      <div class="title">当日追号纪录</div>
      <track-table
        :game="game.code"
        :startDate="today"
        :endDate="today"
        :pageSize="pageSize"
        :page="currentPage"
        :totalCount.sync="totalCount"
        ref="trackTable"/>
      <el-pagination
        v-if="totalCount > pageSize"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="totalCount">
      </el-pagination>
    </div>
    <el-dialog title="确认追号"
      width="45%"
      @closed="didClose"
      :visible.sync="dialog.visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body>
      <el-table :data="dialog.datas" stripe max-height="350">
        <el-table-column label="内容" prop="content"></el-table-column>
        <el-table-column label="金额" prop="amount"></el-table-column>
        <el-table-column label="期数" :min-width="150">
          <template slot-scope="scope">
            {{scope.row.selectedSchedulesText}} 期
          </template>
        </el-table-column>
      </el-table>
      <div class="summary text-center p-t p-b">
        共 {{ bettrack.track_numbers.length}} 组 总金额:
        <span class="red bet-amount text-bold">{{bettrack.track_numbers.length*bettrack.bet_amount | currency('', 1)}}</span>
      </div>
      <el-alert v-if="dialog.errors" :title="dialog.errors" type="error" center :closable="false" show-icon>
      </el-alert>
      <div class="text-center m-t-lg" v-if="!dialog.loaded">
        <el-button size="medium" :loading="dialog.loading" type="primary" :disabled="!dialog.datas.length" @click="placeOrder">确认</el-button>
        <el-button size="medium" @click="dialog.visible = false" :disabled="dialog.loading">取消</el-button>
      </div>
      <el-alert v-else title="成功下单" type="success" center :closable="false" show-icon></el-alert>
    </el-dialog>
  </div>
</template>
<script>
import {validateAmount} from '@/validate'
import {sendBetTrack, fetchMoreSchedule} from '@/api'
import { msgFormatter, loadLastTrack, saveLastTrack } from '@/utils'
import TrackTable from '@/components/TrackTable'
const trackNumRegex = /^(\d+,)*\d+,?$/

export default {
  name: 'GamePostion',
  components: {
    TrackTable
  },
  props: {
    schedule: Object,
    gameClosed: Boolean,
    game: Object
  },
  data () {
    const trackNumberValidator = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error('请输入号码'))
      } else {
        callback()
      }
    }
    const betAmountValidator = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入金额'))
      } else {
        callback()
      }
    }
    const lastTrack = loadLastTrack(this.$route.params.gameId) || {}
    return {
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      trackNums: '',
      amount: lastTrack.bet_amount || 10,
      submitLoading: false,
      curPostionName: lastTrack.pos_name || '',
      today: this.$moment().format('YYYY-MM-DD'),
      usableSchedules: [],
      bettrack: {
        type: lastTrack.type || 1,
        bet_amount: lastTrack.bet_amount || 10,
        track_numbers: [],
        play_code_pattern: ''
      },
      dialog: {
        loading: false,
        loaded: false,
        visible: false,
        datas: [],
        errors: '',
        scheduleId: ''
      },
      rules: {
        track_numbers: [
          {validator: trackNumberValidator, trigger: 'change'}
        ],
        bet_amount: [
          {validator: betAmountValidator, trigger: 'change'}
        ]
      },
      scheduleAnime: false
    }
  },
  computed: {
    bettrackPositions () {
      return this.$store.state.bettrackPositions[this.$route.params.gameId]
    },
    selectedSchedules () {
      return this.usableSchedules.slice(0, this.bettrack.type)
    },
    selectedSchedulesText () {
      return this.selectedSchedules.map(schedule => schedule.issue_number).join(', ')
    },
    gameId () {
      return this.$route.params.gameId
    },
    notification () {
      return this.$store.state.notification
    }
  },
  watch: {
    'bettrackPositions': {
      immediate: true,
      handler: function (data) {
        if (data) {
          this.choosePos(data.positions.find(pos => pos.display_name === this.curPostionName) || data.positions[0])
        }
      }
    },
    'amount': function (amount) {
      if (amount === '') {
        this.bettrack.bet_amount = ''
      } else if (validateAmount(amount)) {
        this.bettrack.bet_amount = parseFloat(amount)
      } else {
        this.$nextTick(() => {
          this.amount = this.bettrack.bet_amount
        })
      }
    },
    'trackNums': function (trackNums) {
      if (trackNums === '') {
        this.bettrack.track_numbers = []
      } else if (!trackNumRegex.test(trackNums)) {
        this.$nextTick(() => { // 格式不符則還原之前的值
          this.trackNums = this.bettrack.track_numbers.join(',')
        })
      } else {
        if (trackNums.endsWith(',')) {
          trackNums = trackNums.slice(0, -1)
        }
        let splited = trackNums.split(',')
        if (splited.length > this.bettrackPositions.max_opts) {
          this.$nextTick(() => { // 追號數量不得大於上限
            this.trackNums = this.bettrack.track_numbers.join(',')
          })
        } else {
          this.bettrack.track_numbers = splited
        }
      }
    },
    'gameClosed': function (gameClosed) {
      if (gameClosed) {
        this.fetchMoreSchedule(this.gameClosed)
      }
    },
    'curPostionName': function (curPostionName) {
      saveLastTrack(this.gameId, {pos_name: curPostionName, type: this.bettrack.type, bet_amount: this.bettrack.bet_amount})
    },
    'bettrack.bet_amount': function (amount) {
      saveLastTrack(this.gameId, {pos_name: this.curPostionName, type: this.bettrack.type, bet_amount: amount})
    },
    'bettrack.type': function (type) {
      saveLastTrack(this.gameId, {pos_name: this.curPostionName, type, bet_amount: this.bettrack.bet_amount})
    },
    'notification': function (notification) {
      if (this.$refs.trackTable && notification.length && notification[0].type === 'bet-track-record') {
        this.$refs.trackTable.fetchBetTrack()
      }
    }
  },
  created () {
    this.fetchMoreSchedule(this.gameClosed)
  },
  methods: {
    choosePos (pos) {
      this.bettrack.play_code_pattern = pos.play_code_pattern
      this.curPostionName = pos.display_name
    },
    submit () {
      this.$refs['bettrack'].validate((valid) => {
        if (valid) {
          let content = `${this.curPostionName} - ${this.bettrack.track_numbers.join(', ')}`
          let amount = this.bettrack.bet_amount
          this.dialog.datas.push({
            content,
            amount,
            selectedSchedulesText: this.selectedSchedulesText
          })
          this.dialog.scheduleId = this.selectedSchedules[0].id
          this.dialog.visible = true
        }
      })
    },
    didClose () {
      this.dialog.loaded = false
      this.dialog.errors = ''
      this.dialog.datas = []
    },
    updateBetrecords () {
      this.$root.bus.$emit('new-betrecords', {
        gameId: this.game.id,
        scheduleId: this.schedule.id
      })
    },
    placeOrder () {
      if (this.dialog.loading) {
        return
      }
      this.dialog.loading = true
      this.dialog.errors = ''
      sendBetTrack({...this.bettrack, game_schedule: this.dialog.scheduleId}).then(() => {
        this.sendGaEvent({action: '投注', category: '遊戲追號', label: this.game.display_name})
        this.dialog.loaded = true
        this.trackNums = ''
        this.$nextTick(() => {
          this.$refs.track_numbers.clearValidate()
          this.$refs.bet_amount.clearValidate()
        })
        setTimeout(() => {
          this.dialog.visible = false
          this.updateBetrecords()
          this.$refs.trackTable.fetchBetTrack()
        }, 1000)
      }).catch(errRes => {
        this.dialog.errors = msgFormatter(errRes)
        setTimeout(() => {
          this.dialog.visible = false
        }, this.dialog.errors && this.dialog.errors.length > 20 ? 5000 : 3000)
      }).finally(() => {
        this.dialog.loading = false
      })
    },
    issueMapper (type) {
      switch (type) {
        case 1:
          return '单期'
        case 2:
          return '两期'
        case 3:
          return '三期'
        default:
          return ''
      }
    },
    fetchMoreSchedule (isGameClosed) {
      fetchMoreSchedule({
        gameId: this.game.id,
        gameCode: this.game.code,
        scheduleId: this.schedule.id,
        type: isGameClosed ? 4 : 3
      }).then(res => {
        this.scheduleAnime = true
        setTimeout(() => {
          this.usableSchedules = isGameClosed ? res.slice(1) : res
          if (this.type > this.usableSchedules.length) {
            this.type = 1 // 若已選期數大於實際可選期數，則預設一期
          }
          this.scheduleAnime = false
        }, 1000)
      }).catch(() => {

      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  .bet-area {
    box-sizing: border-box;
    padding: 58px 20px 20px 20px;
    background: #fff;
    margin-bottom: 20px;
    .bet-form{
      .el-form-item {
        margin-bottom: 20px;
        .hint {
          color: #999;
        }
        .el-input {
          width: 140px;
        }
      }
    }
    .pos-group {
      display: flex;
      .pos-group-item {
        box-sizing: border-box;
        width: 40px;
        height: 32px;
        border: 1px solid #ccc;
        margin-right: 5px;
        color: #333;
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        &.active {
          color: #fff;
        }
      }
    }
    .form-item-label {
      color: #666;
      text-align: left;
      width: 72px;
    }
    .cur-issue-numbers {
      font-size: 14px;
      color: #999;
      opacity: 1;
      transition: opacity 1s ease-in;
      &.fade {
        opacity: 0;
      }
    }
    .submit-btn {
      display: block;
      margin: 0 auto;
    }
  }
  .record-area {
    box-sizing: border-box;
    padding: 20px;
    background: #fff;
    margin-bottom: 20px;
    .title {
      font-size: 14px;
      color: #333;
      margin-bottom: 5px;
    }
  }
  .bet-amount {
    font-size: 14px;
  }
  .summary {
    font-size: 12px;
    padding: 5px;
    background: #f3f4f5;
  }
}
</style>

