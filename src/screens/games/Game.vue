<template>
  <div class="game-container">
    <div class="aside m-r">
      <div class="box">
        <span class="title">账户信息</span>
        <ul v-if="user.account_type===0" class="side-menu">
          <li class="item">
            <span class="text">余额</span>
            <span class="amount balance">{{user.balance | currency('￥')}}</span>
          </li>
          <li class="item">
            <span class="text">未结</span>
            <span class="amount">{{user.unsettled||0 | currency('￥')}}</span>
          </li>
        </ul>
        <ul v-else class="items">
          <li class="item">
            <span class="text">余额</span>
            <span class="amount balance">{{user.balance | currency('￥')}}</span>
          </li>
          <li class="item">
            <span class="text">未结</span>
            <span class="amount">{{user.unsettled||0 | currency('￥')}}</span>
          </li>
        </ul>
        <div v-if="user.account_type===0" class="buttons clearfix">
          <el-button class="large-btn" type="primary" @click="linkTo('/register')">立即注册</el-button>
          <el-button class="large-btn" type="primary" @click="openBetRecordDialog">最新注单</el-button>
        </div>
        <div v-else class="buttons clearfix">
          <el-button class="small-btn" type="primary" @click="linkTo('/account/my/primary_info')">我的账号</el-button>
          <el-button class="small-btn" type="primary" @click="linkTo(paymentPage)">立即 </el-button>
          <el-button class="large-btn" type="primary" @click="openBetRecordDialog">最新注单</el-button>
        </div>
      </div>
      <div class="box">
        <el-tabs class="tabs" v-model="activeTab" v-if="isShowShortcut" type="card">
          <el-tab-pane label="长龙统计" name="statistic">
            <ul class="menu">
              <li class="menu-item" v-for="(item,index) in sortedStatistic" :key="index">
                <span class="text">{{item.title}} - {{item.type | typeFilter}}</span>
                <span class="period">{{item.num}}期</span>
              </li>
              <li v-if="sortedStatistic.length === 0" class="menu-empty">暂无排行榜</li>
            </ul>
          </el-tab-pane>
          <el-tab-pane label="快捷投注" name="shortcut">
            <span
              :class="['shortcut-play', {actived: group.actived}]"
              v-for="(group, index) in shortcutPlayGroups"
              :key="index"
              @click="selectShortcutPlayGroup(group)">{{group.display_name}}</span>
          </el-tab-pane>
        </el-tabs>
        <div class="leader-board-wrapper" v-else>
          <div class="leader-board">
            <div class="title">
              长龙排行榜
            </div>
            <ul class="menu">
              <li class="menu-item" v-for="(item,index) in sortedStatistic" :key="index">
                <p class="statistic-wrapper">
                  <span class="text" v-if="item.type === 'in' || item.type === 'not_in'">{{item.type | typeFilter}} - {{item.title}}</span>
                  <span class="text" v-else>{{item.title}} - {{item.type | typeFilter}}</span>
                </p>
                <span class="period">{{item.num}}期</span>
              </li>
              <li v-if="sortedStatistic.length === 0" class="menu-empty">暂无排行榜</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <el-row>
        <router-view
          v-if="$route.name==='GameCategory'"
          :key="$route.params.categoryId"
          :game="currentGame"
          :scheduleId="schedule && schedule.id ? schedule.id : null"
          :gameClosed="gameClosed"
          @isPlayingBetTrack="getWhetherPlayingBetTrack"
          @clearShortCut="clearShortCut"
          :zodiacMap="zodiacMap"
          ref="gameCategory"/>
        <router-view
          v-else-if="schedule && schedule.id && currentGame"
          :game="currentGame"
          :schedule="schedule"
          :gameClosed="gameClosed"/>
        <Countdown
          v-if="schedule && schedule.id"
          :schedule="schedule"
          :realSchedule="realSchedule"
          :currentGame="currentGame"
          :gameClosed="gameClosed"
          :closeCountDown="closeCountDown"
          :resultCountDown="resultCountDown"/>
      </el-row>
      <el-row class="m-b-xlg">
        <GameStatistic
          v-if="$route.name!=='GamePosition' && hasStatistic"
          :gameCode="currentGame.code"
          :resultStatistic="resultStatistic"/>
      </el-row>
    </div>
  </div>
</template>

<script>
import { fetchSchedule, fetchStatistic, fetchGameResult, fetchBet } from '../../api'
import gameTranslator from '../../utils/gameTranslator'
import { statisticMap } from '../../utils/statisticSetting'
import GameStatistic from '../../components/GameStatistic'
import Countdown from '../../components/Countdown'
import _ from 'lodash'
import { shortcutPlayGroups } from '../../utils/hk6'
import { Indicator } from '../../utils/'
import { mapState } from 'vuex'
const categoryNeedShortcut = ['正码', '特码', '正码特']

export default {
  name: 'game',
  components: {
    GameStatistic,
    Countdown
  },
  filters: {
    typeFilter (val) {
      switch (val) {
        case 'dragon':
          return '龙'
        case 'tiger':
          return '虎'
        case 'bigger':
          return '大'
        case 'smaller':
          return '小'
        case 'great':
          return '极大'
        case 'tiny':
          return '极小'
        case 'outOfDefinition':
          return '无极值'
        case 'odd':
          return '单'
        case 'even':
          return '双'
        case 'straight':
          return '顺子'
        case 'half_straight':
          return '半顺'
        case 'misc_six':
          return '杂六'
        case 'pair':
          return '对子'
        case 'leopard':
          return '豹子'
        case 'blue':
          return '蓝波'
        case 'red':
          return '红波'
        case 'green':
          return '绿波'
        case 'equal':
          return '和'
        case 'gold':
          return '金'
        case 'wood':
          return '木'
        case 'water':
          return '水'
        case 'fire':
          return '火'
        case 'earth':
          return '土'
        case 'front_part_more':
          return '前多'
        case 'rear_part_more':
          return '后多'
        case 'odd_more':
          return '单多'
        case 'even_more':
          return '双多'
        case 'smaller_odd':
          return '小单'
        case 'smaller_even':
          return '小双'
        case 'bigger_odd':
          return '大单'
        case 'bigger_even':
          return '大双'
        case 'east':
          return '东'
        case 'west':
          return '西'
        case 'south':
          return '南'
        case 'north':
          return '北'
        case 'zhong':
          return '中'
        case 'fa':
          return '发'
        case 'bai':
          return '白'
        case 'sumodd':
          return '合数单'
        case 'sumeven':
          return '合数双'
        case 'sumbigger':
          return '合数大'
        case 'sumsmaller':
          return '合数小'
        case 'tailbigger':
          return '尾大'
        case 'tailsmaller':
          return '尾小'
        case 'tailprime':
          return '尾质'
        case 'tailcomposite':
          return '尾合'
        case 'prime':
          return '质'
        case 'composite':
          return '合'
        case 'in':
          return '必出号码'
        case 'not_in':
          return '不出号码'
        default:
          return val
      }
    }
  },
  data () {
    shortcutPlayGroups.forEach(group => {
      group.actived = false
    })

    return {
      realSchedule: null,
      schedule: {
        id: null
      },
      scheduleInterval: '',
      closeCountDown: null,
      resultCountDown: null,
      statistic: [],
      resultStatistic: null,
      activeTab: 'statistic',
      selectedShortcutPlayGroup: {},
      zodiacMap: null,
      shortcutPlayGroups: shortcutPlayGroups,
      indicator: null,
      diffBetweenServerAndClient: 0,
      hasDestroy: false,
      playingBetTrack: false,
      betrecords: []
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    hasStatistic () {
      if (!this.currentGame || !this.currentGame.code) {
        return false
      }
      return this.resultStatistic && statisticMap[this.currentGame.code]
    },
    gameClosed () {
      if (this.realSchedule) {
        return true
      }
      if (!this.closeCountDown) {
        return false
      }
      const c = this.closeCountDown
      return c.days + c.hours + c.minutes + c.seconds === 0
    },
    currentGameId () {
      return this.$route.params.gameId
    },
    currentGame () {
      return this.$store.getters.gameById(this.currentGameId)
    },
    sortedStatistic () {
      return this.statistic.sort((a, b) => {
        return b.num - a.num
      })
    },
    currentCategoryId () {
      return this.$route.params.categoryId
    },
    currentCategory () {
      const categories = this.$store.state.categories[this.$route.params.gameId]
      if (!categories) {
        return null
      } else {
        return categories.find(category => category.id + '' === this.$route.params.categoryId)
      }
    },
    categories () {
      const currentGameId = this.currentGameId
      if (!currentGameId) {
        return []
      }
      return this.$store.state.categories[currentGameId]
    },
    isShowShortcut () {
      if (this.currentCategory) {
        return categoryNeedShortcut.includes(this.currentCategory.display_name) && !this.playingBetTrack
      }
      return false
    },
    paymentPage () {
      const onlinePaymentTypes = this.user.onlinePaymentTypes
      if (onlinePaymentTypes && onlinePaymentTypes.length) {
        return '/account/online_payment'
      } else {
        return '/account/remit'
      }
    }
  },
  watch: {
    'gameClosed': {
      immediate: true,
      handler () {
        if (this.gameClosed) {
          this.$store.dispatch('startNiuNiuLoading', this.currentGame.code)
        }
      }
    },
    'schedule.id': function (newId, oldId) {
      if (newId) {
        fetchBet({
          gameId: this.currentGameId,
          scheduleId: newId
        }).then(res => {
          this.betrecords = res
        })
      }
    },
    'currentGameId': {
      immediate: true,
      handler (currentGameId) {
        let currentGame = this.$store.getters.gameById(this.currentGameId)
        if (currentGame) {
          localStorage.setItem('lastGameCode', currentGame.code)
          this.fetchStatistic()
          this.fetchScheduleAndResult()
        }
      }
    },
    'currentCategoryId': function () {
      this.clearShortCut()
    },
    'currentCategory': function (currentCategory) {
      this.setZodiacMap(currentCategory)
    },
    'zodiacMap': function (zodiacMap) {
      for (let i = 27; i < 39; i++) {
        const group = this.shortcutPlayGroups[i]
        group.num = zodiacMap[group.display_name].map(num => num < 10 ? '0' + num : '' + num)
      }
    },
    '$route': function (to, from) {
      if (to.path === `/game/${this.currentGameId}`) {
        this.chooseCategory()
      }
    },
    '$store.state.isResultRefreshing': function () {
      this.fetchStatistic()
    },
    '$store.state.urgencySwitchedGame': function ({ gameCode, issueNumber, closeLeft }) {
      if (this.currentGame.code === gameCode && this.schedule.issue_number === issueNumber) {
        let closeTime = this.$moment().add(closeLeft, 's')
        this.schedule.schedule_close = closeTime
        this.closeCountDown = this.diffTime(closeTime)
      }
    }
  },
  created () {
    if (!this.$route.params.categoryId) {
      if (this.categories) {
        this.chooseCategory()
      } else {
        this.$store.dispatch('fetchCategories', this.currentGameId)
        const unwatch = this.$watch('categories', function (categories) {
          this.chooseCategory()
          unwatch()
        })
      }
    } else if (!this.categories) {
      this.$store.dispatch('fetchCategories', this.currentGameId)
    }

    this.setZodiacMap(this.currentCategory)
    this.indicator = new Indicator(() => {
      clearInterval(this.scheduleInterval)
      this.startScheduleTimer()
    }, () => {

    })
  },
  beforeDestroy () {
    this.hasDestroy = true
    clearInterval(this.scheduleInterval)
    if (this.indicator) {
      this.indicator.destroy()
    }
  },
  methods: {

    linkTo (path) {
      this.$router.push({ path: path })
    },
    getWhetherPlayingBetTrack (bool) {
      this.playingBetTrack = bool
    },
    fetchScheduleAndResult () {
      if (!this.currentGameId) {
        return
      }

      let promises = [fetchSchedule(this.currentGameId, this.currentGame.code)]

      if (this.currentGame.code === 'hkl') {
        promises.push(fetchGameResult(this.currentGameId))
      }

      Promise.all(promises).then(results => {
        if (this.hasDestroy) {
          return
        }

        const schedule = results[0][0]
        if (schedule) {
          this.schedule = schedule
          let serverTime = this.$moment(this.schedule.schedule_result)
          this.schedule.schedule_result = this.$moment().add(schedule.result_left, 's')
          this.diffBetweenServerAndClient = serverTime.diff(this.schedule.schedule_result)
          this.schedule.schedule_close = this.$moment().add(schedule.close_left, 's')
        } else {
          this.closeCountDown = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          }
        }

        // 六合彩
        if (results[1]) {
          const result = results[1][0]
          let realScheduleIssueNumber = parseInt(result.issue_number)
          let estimateScheduleIssueNumber
          // 六合彩至多149期，所以149期下一期跳001期為合理
          if (!schedule.issue_number.endsWith('001') || !result.issue_number.endsWith('149')) {
            estimateScheduleIssueNumber = parseInt(schedule.issue_number)
            if (estimateScheduleIssueNumber - 1 > realScheduleIssueNumber) { // 差超過一期，表示可能尚未抓到開獎結果
              this.realSchedule = `${realScheduleIssueNumber + 1}`
            }
          }
        }

        this.startScheduleTimer()
      }).catch(() => { })
    },
    chooseCategory () {
      const categoryId = this.$store.state.lastGameData.lastCategory[this.currentGameId] || this.categories[0].id
      this.$router.replace(`/game/${this.currentGameId}/${categoryId}`)
    },
    startScheduleTimer () {
      clearInterval(this.scheduleInterval)
      if (this.hasDestroy) {
        return
      }
      if (!this.schedule || !this.schedule.id) {
        return
      }
      this.scheduleInterval = setInterval(() => {
        const closeTime = this.schedule.schedule_close
        const resultTime = this.schedule.schedule_result
        this.closeCountDown = this.diffTime(closeTime)
        this.resultCountDown = this.diffTime(resultTime, true)
      }, 1000)
    },
    diffTime (target, flag) {
      const duration = this.$moment.duration(target.diff())
      let days = duration.days()
      let hours = duration.hours()
      let minutes = duration.minutes()
      let seconds = duration.seconds()
      if (flag && (days + hours + minutes + seconds <= 0)) {
        clearInterval(this.scheduleInterval)
        this.fetchScheduleAndResult()
      }
      days = days < 0 ? 0 : days
      hours = hours < 0 ? 0 : hours
      minutes = minutes < 0 ? 0 : minutes
      seconds = seconds < 0 ? 0 : seconds
      return {
        days,
        hours,
        minutes,
        seconds
      }
    },
    fetchStatistic () {
      const code = this.currentGame.code
      fetchStatistic(code).then(result => {
        if (this.hasDestroy) {
          return
        }
        const translator = gameTranslator[code]
        const frequencyStats = result.frequency_stats
        if (Array.isArray(result)) {
          this.resultStatistic = null
        } else {
          this.resultStatistic = {
            resultSingleStatistic: result.result_single_statistic,
            daRoadStatistic: result.result_category_statistic,
            jupanRoadStatistic: result.result_category_statistic_jupanroad,
            bigEyeRoadStatistic: result.result_category_statistic_bigeyeroad,
            littleRoadStatistic: result.result_category_statistic_littleroad,
            beetleRoadStatistic: result.result_category_statistic_beetleroad
          }
        }

        const keys = Object.keys(frequencyStats)
        const statistic = []
        _.each(keys, (key) => {
          let item = frequencyStats[key]
          let type = Object.keys(item)
          if (type.length === 0) {
            return
          }
          type = type[0]
          if (item[type] < 3) { // 只取連續三期以上
            return
          }
          let translated = translator(key)
          if (!translated[0]) {
            return
          }
          statistic.push({
            title: translated[0],
            type: translated[1] ? translated[1] + type : type,
            num: item[type]
          })
        })
        this.statistic = statistic
      }).catch(() => { })
    },
    selectShortcutPlayGroup (group) {
      this.selectedShortcutPlayGroup.actived = false
      this.selectedShortcutPlayGroup = group
      group.actived = true
      this.$refs['gameCategory'].triggerShortcut(group)
    },
    clearShortCut () {
      this.selectedShortcutPlayGroup.actived = false
      this.selectedShortcutPlayGroup = {}
    },
    setZodiacMap (currentCategory) {
      if (!this.zodiacMap && currentCategory && currentCategory.extra_info) {
        this.zodiacMap = this.currentCategory.extra_info.shaw
      }
    },
    openBetRecordDialog () {
      this.$store.dispatch('updateBetRecordDialog', {type: 'ongoing', visible: true, schedule: this.schedule.id})
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../style/vars.scss";
.game-container {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  width: 1040px;
  padding: 10px 10px 0 10px;
  .aside {
    width: 180px;
  }
  .main {
    width: 830px;
  }
}

.box {
  max-height: 100vh;
  margin-bottom: 10px;
  background: #fff;
  .items {
    max-height: 300px;
    overflow-y: auto;
  }
  .title {
    display: block;
    height: 32px;
    line-height: 32px;
    font-size: 13px;
    color: #9b9b9b;
    text-align: center;
    border-bottom: 1px solid $pinkish-grey;
    margin-bottom: 10px;
  }

  .item {
    height: 24px;
    line-height: 24px;
    padding: 0 10px;
    color: #666;
    .text {
      font-size: 12px;
    }
    .balance {
      color: $red;
    }
    .amount {
      float: right;
      display: block;
      text-align: right;
    }
  }
  .record {
    padding: 5px 0;
    border-bottom: 1px solid #f5f5f5;
    margin: 0 10px;
    font-size: 12px;
    color: #666;
    .odds {
      color: $red;
    }
    .play-name {
      color: #666;
    }
    .selected-numbers {
      word-break: break-all;
    }
  }
  .empty {
    height: 30px;
    line-height: 30px;
    padding: 0 0 10px;
    color: #ccc;
    text-align: center;
    font-weight: 200;
  }

  .buttons {
    margin-top: 10px;
    text-align: center;
    padding: 0 10px 10px;
    .el-button {
      float: left;
      width: 75px;
    }
    .large-btn.el-button {
      margin: 10px 0 0;
      width: 160px;
    }
  }
}

.tabs.el-tabs--top {
  /deep/ .el-tabs__header {
    margin: 0;
  }
  /deep/ .el-tabs__nav-wrap.is-scrollable {
    padding: 0;
  }
  /deep/ .el-tabs__nav-prev {
    display: none;
  }
  /deep/ .el-tabs__nav-next {
    display: none;
  }
  /deep/ .el-tabs__nav-scroll {
    padding-left: 0;
  }
  /deep/ .el-tabs__item {
    padding: 0 10px;
    width: 90px;
    box-sizing: border-box;
    text-align: center;
  }
}
.shortcut-play {
  display: inline-block;
  box-sizing: border-box;
  border-right: 1px solid $pinkish-grey;
  border-top: 1px solid $pinkish-grey;
  color: #35406d;
  width: 60px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  cursor: pointer;
  &:nth-child(1),
  &:nth-child(2),
  &:nth-child(3) {
    border-top: none;
  }
  &:nth-child(3n) {
    border-right: none;
  }
  &.actived {
    background: #f3dab2;
  }
}
.tabs {
  float: right;
  width: 180px;
}
.leader-board,
.tabs {
  background: #fff;
  font-size: 13px;
  .title {
    color: #9b9b9b;
    text-align: center;
    height: 32px;
    line-height: 32px;
    border-bottom: 1px solid $pinkish-grey;
  }
  .menu-empty {
    color: #ccc;
    text-align: center;
    line-height: 30px;
    height: 30px;
    padding: 10px 0;
    font-weight: 200;
  }
  .menu-item {
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    color: #666;
    border-bottom: 1px solid $pinkish-grey;
    .period {
      float: right;
      color: $watermelon;
    }
  }
}
.main {
  float: left;
  width: 890px;
}

.current-game {
  position: absolute;
}
.el-tabs__header {
  margin-bottom: 5px;
}

.el-tabs--top /deep/.el-tabs__nav-scroll {
  padding: 0;
}
.statistic-wrapper {
  display: inline-block;
}

.right-wrapper {
  float: right;
  width: 180px;
}

.plansite-button {
  width: 100%;
  font-size: 13px;
  .img,
  .text {
    vertical-align: middle;
  }
}

.large-btn.el-button {
  width: 100%;
}
</style>
