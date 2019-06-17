<template>
  <div class="skin__overview">
    <section>
      <p class="balance-title" :data-balance="user.balance | currency('￥', 2)">余额</p>
      <div class="wrapper contact">
        <div :class="['info-box', 'info-box-horizontal', {warn: info.warn ,clickable: info.editable}]"
          v-for="(info, index) in userInfos"
          @click="info.editable && info.click()"
          :key="index">
          <div class="contact-info">
            <div class="icon-box">
              <icon :name="info.icon" class="icon" :style="{color: themeColor}" scale="1.5"></icon>
            </div>
            <p class="title">{{info.title}}</p>
            <p class="content">{{info.value}}</p>
          </div>
          <icon v-if="info.editable"
            :style="{color: themeColor}"
            name="edit"
            class="icon"
            scale="1.5">
          </icon>
        </div>
      </div>
      <div class="wrapper">
        <div :class="['info-box', 'info-box-vertical', {badge: !!record.badge}]"
          v-for="(record, recordIndex) in records"
          :data-badge="statusTranslator(record.badge)"
          :key="recordIndex">
          <p class="record-title">{{record.event}}</p>
          <div>
            <template v-if="record.type && record.type.indexOf('n_') !== -1">
              <div :class="`not-found not-found-${record.type}`" :data-msg="record.text"></div>
            </template>
            <template v-else>
              <p class="record-value">{{record.value}}</p>
              <ul class="record-list">
                <li class="list-item" v-for="(item, itemIndex) in record.list" :key="itemIndex">
                  <p class="name">{{item.name}}</p>
                  <span v-if="typeof(item.content) === 'string' || typeof(item.content) === 'number'" v-html="item.content" class="content"></span>
                  <div class="progress-bar" v-else>
                    <div class="progress"
                      :class="step.processing ? 'processing' : 'completed'"
                      v-for="(step, stepIndex) in item.content"
                      :key="stepIndex">
                      <i :class="['dot', step.status]"
                        :data-text="step.text">
                      </i>
                    </div>
                  </div>
                </li>
              </ul>
            </template>
          </div>
          <el-button type="primary" class="button" @click.native="$router.push(record.button.linkTo)">{{record.button.text}}</el-button>
        </div>
      </div>
    </section>
    <section class="report">
      <div class="report-header">
        <span class="date-title" :data-date="thisWeekString">个人周报</span>
        <el-button type="text" class="link" @click.native="$router.push({name: 'PersonalReport'})">查看个人报表</el-button>
      </div>
      <div class="report-body info-box">
        <div :class="['item', r.trend]" v-for="(r, index) in report" :key="index">
          <p class="value" :data-title="r.title">{{r.value}}</p>
          <p :class="['subtitle', r.subtitle.class]">{{r.subtitle.text}}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {map, replace, each} from 'lodash'
import '@/components/icon/phone'
import '@/components/icon/email'
import '@/components/icon/qq'
import '@/components/icon/bank'
import '@/components/icon/wechat'
import '@/components/icon/edit'
import {fetchOverview} from '../../api'

export default {
  name: 'Overview',
  filters: {
    infoTranslator (value) {
      switch (value) {
        case 'bank':
          return '取款银行卡'
        case 'phone':
          return '手机号'
        case 'qq':
          return 'QQ'
        case 'wechat':
          return '微信'
        case 'email':
          return '邮件信箱'
        case 'empty':
          return '未填写'
        default:
          return '-'
      }
    },
    eventTranslator (value) {
      switch (value) {
        case 'n_unsettled':
          return '未结注单'
        case 'n_latest_withdraw':
          return '最近一次取款'
        case 'n_latest_deposit':
          return '最近一次存款'
        case 'n_bettrackrecord':
          return '最新追号单'
        case 'unsettled':
          return '未结注单'
        case 'latest_withdraw':
          return '最近一次取款'
        case 'latest_deposit':
          return '最近一次存款'
        case 'bettrackrecord':
          return '最新追号单'
        default:
          return '-'
      }
    },
    notFoundMsgTranslator (value) {
      switch (value) {
        case 'n_unsettled':
          return '没有未结注单，马上去下注吧！'
        case 'n_latest_withdraw':
          return '还没有取款记录，马上下注赢钱吧！'
        case 'n_latest_deposit':
          return '还没有存款记录，马上 吧！'
        case 'n_bettrackrecord':
          return '没有追号单，马上去追号吧！'
        default:
          return '-'
      }
    },
    btnMsgTranslator (value) {
      switch (value) {
        case 'n_unsettled':
          return '立即下注'
        case 'n_latest_withdraw':
          return '立即下注'
        case 'n_latest_deposit':
          return '立即 '
        case 'n_bettrackrecord':
          return '立即追号'
        case 'unsettled':
          return '查看未结注单'
        case 'latest_deposit':
          return '查看 纪录'
        case 'latest_withdraw':
          return '查看取款纪录'
        case 'bettrackrecord':
          return '查看追号纪录'
        default:
          return '-'
      }
    },
    reportTitleTranslator (value) {
      switch (value) {
        case 'this_week_bet_count':
          return '注单'
        case 'this_week_total_amount':
          return '下注金额'
        case 'this_week_return_amount':
          return '反水'
        case 'this_week_profit':
          return '盈亏'
        default:
          return '-'
      }
    }
  },
  data () {
    const m = this.$moment()
    let today = m.format('YYYY-MM-DD')
    let previous = m.subtract(7, 'days').format('YYYY-MM-DD')
    return {
      interval: null,
      records: [{button: {}}, {button: {}}, {button: {}}, {button: {}}],
      report: [],
      thisWeekString: `${previous} ~ ${today}`,
      formattedWinningString: (whole, picked) => {
        if (!picked) return whole.join(', ')
        let str = Array.isArray(whole) ? whole.join(', ') : whole
        return replace(str, new RegExp(picked, 'g'), `<span class="red">${picked}</span>`)
      },
      reportCompareObj: (compareValue, isCurrency) => {
        let obj = {}
        if (compareValue !== 0) {
          let value = ''
          if (isCurrency) {
            value = this.$options.filters.currency(Math.abs(compareValue), '￥')
          } else {
            value = ` ${Math.abs(compareValue)} 注`
          }

          if (compareValue > 0) {
            obj.text = '比上周增加' + value
            obj.class = 'increasing'
          } else {
            obj.text = '比上周减少' + value
            obj.class = 'decreasing'
          }
        }
        return obj
      }
    }
  },
  methods: {
    statusTranslator (value) {
      switch (value) {
        case 1:
          return this.$t('user.success')
        case 2:
          return this.$t('user.failed')
        case 3:
          return this.$t('user.ongoing')
        case 4:
          return this.$t('user.cancelled')
        case 5:
          return this.$t('user.declined')
        case 6:
          return this.$t('user.payment_pending')
        case 'win':
          return '中'
        case 'death':
          return '挂'
        case 'cancelled':
          return '已取消'
        case 'ongoing':
          return '进行中'
        default:
          return '-'
      }
    },
    getData () {
      fetchOverview().then((res) => {
        let entries = Object.entries(res)
        let records = []
        each(entries, (entry) => {
          let [key, value] = [entry[0], entry[1]]
          let type = value ? key : `n_${key}`
          let formattedRecord = {
            type,
            event: this.$options.filters.eventTranslator(type),
            button: this.initButton(type),
            text: this.$options.filters.notFoundMsgTranslator(type)
          }

          if (value) {
            switch (key) {
              case 'unsettled':
                formattedRecord = {...formattedRecord, ...this.formatUnsettled(key, value)}
                break
              case 'latest_deposit':
                formattedRecord = {...formattedRecord, ...this.formatDepositAndWithdraw(key, value)}
                break
              case 'latest_withdraw':
                formattedRecord = {...formattedRecord, ...this.formatDepositAndWithdraw(key, value)}
                break
              case 'bettrackrecord':
                formattedRecord = {...formattedRecord, ...this.formatBettrack(key, value)}
                break
              case 'week_report':
                this.getFormattedReport(entry[1])
                return
              default:
                return
            }
          }

          records.push(formattedRecord)
        })
        this.records = records
      })
    },
    getFormattedReport (obj) {
      const keys = ['this_week_bet_count', 'this_week_total_amount', 'this_week_return_amount', 'this_week_profit']
      this.report = map(keys, (key) => {
        let compareKey = key.split('this_week_')[1] + '_compare'
        let filtered = {
          title: this.$options.filters.reportTitleTranslator(key),
          value: (key === 'this_week_bet_count') ? obj[key] : this.$options.filters.currency(obj[key], '￥'),
          subtitle: (key === 'this_week_bet_count') ? this.reportCompareObj(obj[compareKey], false) : this.reportCompareObj(obj[compareKey], true),
          trend: (key === 'this_week_profit') ? `${key}-${obj[key] > 0 ? 'increasing' : obj[key] === 0 ? '' : 'decreasing'}` : key
        }
        return filtered
      })
    },
    formatUnsettled (key, obj) {
      return {
        value: this.$options.filters.currency(obj.unsettled_amounts, '￥'),
        list: [
          {name: '总下注数', content: `${obj.unsettled_bets} 筆`},
          {name: '可赢金额', content: this.$options.filters.currency(obj.unsettled_win_amounts, '￥')}
        ]
      }
    },
    formatDepositAndWithdraw (key, obj) {
      return {
        value: this.$options.filters.currency(obj.amount, '￥'),
        list: [
          {
            name: '交易时间',
            content: this.$moment(obj.created_at).format('YYYY-MM-DD HH:mm:ss')
          },
          {
            name: '审核状态',
            content: this.setProcessBar(obj.status)
          }
        ]
      }
    },
    formatBettrack (key, obj) {
      let issues = ''
      if (obj.play) {
        issues = `${obj.game_schedules.length} 期 (${obj.game_schedules[0].slice(-3)}-${obj.game_schedules[obj.game_schedules.length - 1].slice(-3)})`
      } else {
        issues = this.formattedWinningString(obj.issue_numbers || obj.game_schedules, obj.winning_schedule)
      }
      return {
        value: (obj.status === 'cancelled' || obj.status === 'ongoing') ? this.statusTranslator(obj.status) : this.$options.filters.currency(obj.profit, '￥'),
        list: [
          {name: '游戏', content: obj.game.display_name || obj.game},
          {name: '位置/号码', content: obj.play ? `${obj.play.playgroup}@${obj.play.display_name}` : `${obj.play_position}-${this.formattedWinningString(obj.track_numbers, obj.winning_number)}`},
          {name: '期号', content: issues}
        ],
        badge: (obj.status === 'win' || obj.status === 'death') ? obj.status : null
      }
    },
    setProcessBar (status) {
      const progress = [
        {text: '提交申请', status: 'completed', processing: false},
        {text: '审核中', status: 'completed', processing: false},
        {text: '-', status: 'completed'}
      ]
      const completedStatuses = [1, 2, 4, 5]
      const isCompleted = completedStatuses.includes(status)

      progress[1].processing = !isCompleted
      progress[2].status = isCompleted ? `completed status-${status}` : 'waiting'
      progress[2].text = isCompleted ? this.statusTranslator(status) : ''

      return progress
    },
    initButton (type) {
      let linkTo = {}
      switch (type) {
        case 'n_unsettled':
          linkTo = {name: 'GameCategory'}
          break
        case 'n_latest_withdraw':
          linkTo = {name: 'GameCategory'}
          break
        case 'n_latest_deposit':
          linkTo = (this.user.onlinePaymentTypes && this.user.onlinePaymentTypes.length) ? {name: 'OnlinePayment'} : {name: 'Remit'}
          break
        case 'n_bettrackrecord':
          linkTo = {name: 'GameCategory'}
          break
        case 'unsettled':
          linkTo = {path: '/account/bet_record/unsettled'}
          break
        case 'latest_withdraw':
          linkTo = {path: '/account/finance/withdraw_record'}
          break
        case 'latest_deposit':
          linkTo = {path: '/account/finance/payment_record'}
          break
        case 'bettrackrecord':
          linkTo = {path: '/account/finance/track_record'}
          break
      }
      return {
        text: this.$options.filters.btnMsgTranslator(type),
        linkTo
      }
    }
  },
  created () {
    this.getData()
    this.interval = setInterval(() => { this.getData() }, 30000)
  },
  computed: {
    ...mapState({
      user: state => state.user,
      themeColor: state => state.systemConfig.themeColor || '#ddd'
    }),
    userInfos () {
      const thirdCol = ['wechat', 'qq', 'email']
      const display = [
        {
          icon: 'bank',
          title: this.$options.filters.infoTranslator('bank'),
          value: this.user['bank'] && this.user['bank'].bank ? (this.user['bank'].bank + ' ' + this.user['bank'].account) : '未填写',
          editable: !this.user['bank'],
          warn: !this.user['bank'],
          click: () => { this.$router.push({name: 'BankInfo'}) }
        },
        {
          icon: 'phone',
          title: this.$options.filters.infoTranslator('phone'),
          value: this.user['phone'] || '未填写',
          editable: !this.user['phone'],
          warn: !this.user['phone'],
          click: () => { this.$router.push({name: 'PrimaryInfo'}) }
        }
      ]
      let third = {}
      let picked = ''
      for (let i = 0; i < thirdCol.length; i++) {
        if (this.user[thirdCol[i]]) {
          picked = thirdCol[i]
          break
        }
      }
      third = {
        icon: picked || 'wechat',
        title: picked ? this.$options.filters.infoTranslator(picked) : '其他联络方式',
        value: picked ? this.user[picked] : '未填写',
        editable: true,
        click: () => { this.$router.push({name: 'PrimaryInfo'}) },
        warn: !picked
      }
      display.push(third)
      return display
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss" scoped>

$dotColor: #ddd;
$boxColor: fade-out($dotColor, .9);
$lineColor: fade-out($dotColor, .7);
$horizontalHeight: 50px;

.balance-title {
  height: 70px;
  line-height: 30px;
  font-size: 20px;
  &::after {
    content: attr(data-balance);
    display: block;
    height: 40px;
    line-height: 40px;
    font-size: 28px;
  }
}

.wrapper {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.info-box {
  position: relative;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  &.clickable {
    &:hover {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
      opacity: .9;
    }
  }
  &:not(:last-child) {
    margin-right: 15px;
  }

  &-horizontal {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    height: $horizontalHeight;
    flex: 1 1 340px;
  }

  &-vertical {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 250px;
    min-height: 320px;
    .button {
      width: 100%;
      height: 32px;
      margin-top: auto;
    }
  }

  &.badge::after {
    content: attr(data-badge);
    position: absolute;
    display: inline-block;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    text-align: center;
    line-height: 32px;
    color: #ccc;
    border-radius: 50%;
    box-shadow: 0px 0px 0px 2px #ddd inset,
    0px 0px 0px 4px #fff inset,
    0px 0px 0px 5px #ddd inset;
  }
}


.contact {
  .warn .content {
    color: #d0021b;
  }
  &-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    .title, .content {
      height: $horizontalHeight / 2;
    }

    .title {
      height: 20px;
      color: #999;
      font-size: 14px;
    }

    .content {
      font-size: 16px;
      height: 30px;
    }
  }

  .icon-box {
    border-radius: 10px;
    background-color: $boxColor;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    margin-right: 10px;
  }

  .icon {
    height: $horizontalHeight;
    line-height: $horizontalHeight;
    transition: all .1s ease-in;
  }
}




.record {
  &-title {
    font-size: 16px;
    &:empty {
      display: block;
      height: 20px;
      background-image: linear-gradient(to right, #eee 55px, transparent 55px);
      background-size: 55px 20px;
      background-repeat: no-repeat;
    }
  }

  &-value {
    height: 50px;
    line-height: 50px;
    font-size: 36px;
    margin-bottom: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    &:empty {
      background-image: linear-gradient(to right, #eee 140px, transparent 140px);
      background-size: 140px 35px;
      background-repeat: no-repeat;
      background-position: 0 10px;
    }
  }

  &-list {
    .list-item {
      min-height: 45px;
      margin-bottom: 15px;
      .name, .content {
        display: block;
        line-height: 20px;
        font-size: 14px;
      }
      .name {
        color: #bfbfbf;
        margin-bottom: 5px;
      }
    }
    &:empty {
      display: inline-block;
      width: 100%;
      height: 150px;
      background-image: linear-gradient(to right, #eee 55px, transparent 55px),
      linear-gradient(to right, #eee 65px, transparent 65px),
      linear-gradient(to right, #eee 55px, transparent 55px),
      linear-gradient(to right, #eee 80px, transparent 80px);
      background-size: 55px 15px, 65px 15px, 55px 15px, 80px 15px;
      background-position: 0 0,0 25px, 0 55px, 0 80px;
      background-repeat: no-repeat;
    }
  }
}

.progress-bar {
  display: flex;
  justify-content: center;
  height: 50px;
  margin-top: 10px;
  font-size: 12px;
  .progress {
    position: relative;
    display: inline-block;
    width: 70px;
    height: 2px;
    transition: all .3s ease-in;
    background: lightgray;
    &.completed {
      background: $lineColor;
    }
    &.processing {
      background: linear-gradient(
        to right,
        $lineColor 10%, transparent 10%,
        transparent 20%, $lineColor 20%,
        $lineColor 30%, transparent 30%,
        transparent 40%, $lineColor 40%,
        $lineColor 50%, transparent 50%,
        transparent 60%, $lineColor 60%,
        $lineColor 70%, transparent 70%,
        transparent 80%, $lineColor 80%,
        $lineColor 90%, transparent 90%,
        transparent 95%, $lineColor 95%
      );
    }

    &:first-child {
      left: -12px;
      .dot {
        left: -30px;
      }
    }
    &:nth-child(2n) {
      .dot {
        left: -30px;
      }
    }
    &:last-child {
      width: 0;
      .dot {
        left: -18px;
      }
    }
  }

  .dot {
    display: inline-block;
    position: relative;
    top: -9px;
    text-align: center;
    color: #333;
    &::before {
      content: '';
      top: -((8px + 2px) / 2);
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid $lineColor;
      background-color: lightgray;
      background-clip: padding-box;
      transition: all .2s ease-in;
    }

    &::after {
      content: attr(data-text);
      display: block;
      color: currentColor;
      width: 48px;
    }

    &.completed {
      &::before {
        background-color: $dotColor;
      }

      &.status-1 {
        color: #7ed321;
      }

      &.status-4, &.status-5 {
        color: #d0021b;
      }
    }

    &.waiting {
      &::before {
        background-color: transparent;
      }
    }
  }
}



.not-found {
  position: relative;
  width: 100%;
  height: 235px;
  background-position: center 10px;
  background-repeat: no-repeat;
  &::after {
    content: attr(data-msg);
    position: absolute;
    bottom: 35px;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }
  &-n_latest_withdraw, &-n_latest_deposit {
    background-image: url('../../assets/account_overview/not_found_account.png');
  }
  &-n_unsettled, &-n_bettrackrecord {
    background-image: url('../../assets/account_overview/not_found_record.png');
  }
}


.report {
  margin-top: 30px;

  &-header {
    display: flex;
    height: 25px;
    margin-bottom: 10px;
    align-items: center;
    .date-title {
      font-size: 16px;
      font-weight: normal;
      &::after {
        content: attr(data-date);
        display: inline-block;
        margin-left: 10px;
        font-size: 14px;
        color: #999;
      }
    }
    .link {
      margin-left: auto;
    }
  }

  &-body {
    display: flex;
    justify-content: space-around;
    flex-direction: row;
    padding-top: 25px;
    padding-bottom: 25px;
    padding-left: 50px;
    padding-right: 50px;
    min-height: 140px;

    .item {
      position: relative;
      width: 25%;
      text-align: center;
      &.this_week_profit {
        &-increasing .value {
          color: #d0021b;
        }

        &-decreasing .value {
          color: #7ed321;
        }
      }
      .value {
        font-size: 36px;
        &::before {
          content: attr(data-title);
          display: block;
          font-size: 14px;
          color: #999;
        }
      }

      .subtitle {
        font-size: 14px;
      }

      &:not(:last-child) {
        &::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 1px;
          background: linear-gradient(to bottom, transparent 15%, #eee 15%, #eee 85%, transparent 85%);
        }
      }
    }
  }
}

.decreasing {
  color: #7ed321;
  &::before {
    content: '';
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 5px 5px 5px;
    border-color: currentColor transparent transparent transparent;
  }
}

.increasing {
  color: #d0021b;
  &::before {
    content: '';
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0px 5px 8px 5px;
    border-color: transparent transparent currentColor transparent;
  }
}
</style>
