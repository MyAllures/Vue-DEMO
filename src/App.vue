<template>
  <div v-loading.fullscreen="$store.state.loading"
    element-loading-text="加载中..."
    class="block-center" id="app">
    <Top class="header-block"/>
    <div class="main-block" :style="{minHeight: bodyHeight + 'px'}">
      <keep-alive include="Home">
        <router-view />
      </keep-alive>
    </div>
    <Bottom v-if="!$route.params.gameId"/>
    <el-dialog
      :title="$t('navMenu.pop_title')"
      :visible="loginDialogVisible"
      width="740px"
      top="205px"
      @close="closeLoginDialog"
      center>
      <LoginPopup/>
    </el-dialog>
    <el-dialog
      :title="betRecordDialog.type === 'ongoing' ? '最新注单' : $t('user.betrecord')"
      :visible="betRecordDialog.visible"
      width="1080px"
      @close="closeBetRecordDialog"
      center>
      <OngoingBetRecord v-if="betRecordDialog.visible && betRecordDialog.type === 'ongoing'"></OngoingBetRecord>
      <BetRecord v-else-if="betRecordDialog.visible" :isModal="true" :lazyFetch="!betRecordDialog.visible"/>
    </el-dialog>
    <el-dialog
      :title="'继续试玩'"
      :visible="showTrialVerifyDialog"
      @close="closeVerifyTrialDialog"
      width="360px"
      append-to-body
      center>
      <div>
        <el-form ref="user">
          <el-form-item :label="'验证码'" label-width="70px">
            <el-input class="input-width" :maxlength="4" v-model="user.verification_code_1" auto-complete="off"></el-input>
            <div class="m-t">
              <el-col :span="12">
                <img class="captcha" :src="captcha_src" height="32">
              </el-col>
              <el-col :span="12" :pull="2" class="text-right">
                <el-button type="info" icon="el-icon-refresh" class="captcha-getter" @click="fetchCaptcha"></el-button>
              </el-col>
            </div>
            <el-button class="input-width" type="primary" @click.native="tryplay">继续试玩</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <CampaignEnvelope v-if="systemConfig.envelopeActivityId" :campaignId="systemConfig.envelopeActivityId"></CampaignEnvelope>
    <CustomerService v-if="systemConfig.enableBuiltInCustomerService"></CustomerService>
    <RightNav v-if="systemConfig.state === 'fulfilled'"
      :systemConfig="systemConfig"
    ></RightNav>
  </div>
</template>

<script>
import './style/reset.css'
import './style/base.scss'
import './style/theme.scss'
import './style/animate.css'
import Top from './components/Header'
import Bottom from './components/Footer'
import LoginPopup from './components/LoginPopup'
import BetRecord from './screens/member/BetRecord'
import OngoingBetRecord from './components/OngoingBetRecord'
import CampaignEnvelope from './components/CampaignEnvelope'
import { getToken, fetchCaptcha } from './api'
import { Indicator, msgFormatter } from './utils'
import CustomerService from './components/CustomerService'
import RightNav from './components/RightNav'
import { mapState } from 'vuex'
import 'vue-awesome/icons/exclamation'

export default {
  name: 'app',
  filters: {
    statusFilter (value) {
      switch (value) {
        case 'cancelled':
          return '取消'
        case 'win':
          return '中'
        case 'lose':
        case 'death':
          return '挂'
        case 'stop':
          return '停止追号'
        default:
          return '进行中'
      }
    }
  },
  data () {
    return {
      getMessageInterval: '',
      bodyHeight: ~~(document.documentElement.clientHeight - 330),
      illegalTrial: false,
      captcha_src: '',
      user: {
        verification_code_0: '',
        verification_code_1: ''
      },
      indicator: null,
      refreshTokenTimer: null,
      currentNotification: null
    }
  },
  components: {
    Top,
    Bottom,
    LoginPopup,
    BetRecord,
    CampaignEnvelope,
    CustomerService,
    RightNav,
    OngoingBetRecord
  },
  methods: {
    bettrackRecordMsg (h, notification) {
      return (
        <div class="bettrack-notification">
          <p class="title">追号通知</p>
          <p class="total-amount">盈亏总计<span class={[notification.total_profit < 0 ? 'green' : 'red', 'm-l']}>{this.$options.filters.currency(notification.total_profit, '￥')}</span></p>
          <div class="content">
            <div class="game-list">
              {
                notification.bet_track_records.map((game) => {
                  let trackNumbers = []
                  if (typeof (game.track_numbers) === 'string') {
                    trackNumbers.push(game.track_numbers)
                  } else {
                    trackNumbers = game.track_numbers
                  }
                  return (
                    <div class="game-list-item">
                      <div class="track-header">
                        <div class="track-header-left">
                          <div class="name">{game.game_name}</div>
                          <div class="issue">{game.play ? `${game.play.playgroup} - ${game.play.display_name}` : `${(game.play_position)} - ${trackNumbers.join(', ')}`}</div>
                        </div>
                        <p class={`track-header-right${game.profit < 0 ? ' green' : ''}`}>{this.$options.filters.currency(game.profit, '￥')}</p>
                      </div>
                      <div class="track-list">
                        {
                          game.game_schedules.map((track) => {
                            return (
                              <div class="track-list-item">
                                <span>{`${track.issue_number} 期`}</span>
                                <div class="status-field">
                                  {
                                    game.reason && track.status === 'cancelled'
                                      ? [
                                        <span class={track.status}>{this.$options.filters.statusFilter(track.status)}</span>,
                                        <el-popover
                                          popper-class="bettrack-tip-popover in-notify"
                                          placement="bottom-end"
                                          width="auto"
                                          offset={30}
                                          trigger="hover"
                                          content={game.reason}>
                                          <icon class="tip-icon" name="exclamation" slot="reference"/>
                                        </el-popover>
                                      ]
                                      : <span class={track.status}>{this.$options.filters.statusFilter(track.status)}</span>
                                  }
                                </div>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      )
    },
    winMsg (h, notification) {
      return (
        <div class="win-notification">
          <p class="title">中奖明细</p>
          <div class="game">
            <div>
              <p class="name">{notification.game_name}</p>
              <p class="issue">{`${notification.issue_number}期`}</p>
            </div>
            <p class="amount">盈利: {this.$options.filters.currency(notification.total_profit, '￥')}</p>
          </div>
          <div class="result-list-title">
            <span class="play">玩法</span>
            <span class="bet-amount" v-if="bet.bet_amount">投注金额</span>
            <span class="profit">盈利</span>
          </div>
          <ul class="result-list">
            {
              notification.win_bets.map((bet, index) => {
                return (
                  <li class="result">
                    <span class="play">{`${index + 1}. ${bet.playgroup_name} @ ${bet.play_name}`}</span>
                    <span class="bet-amount" v-if="bet.bet_amount">{this.$options.filters.currency(bet.bet_amount, '￥')}</span>
                    <span class="profit">{this.$options.filters.currency(bet.profit, '￥')}</span>
                    {bet.comb_desc ? <p class="combination">{bet.comb_desc}</p> : ''}
                  </li>
                )
              })
            }
          </ul>
        </div>
      )
    },
    linkTobetrecord (notification, win) {
      let game = this.games.find((game) => (win.game_code === game.code))
      this.$router.push({
        path: '/account/bet_record/settled',
        query: {
          startdate: notification.last_login_date,
          enddate: notification.current_login_date,
          game: game.id
        }
      })
      this.currentNotification.close()
    },
    bachWinMsg (h, notification) {
      return (
        <div class="win-notification batch">
          <p class="title">中奖明细</p>
          <p class="congratulation">恭喜！您下过的游戏中奖啰～</p>
          <div class="game">
            <p>
              <span>中奖总额: </span><span class="amount">{this.$options.filters.currency(notification.total_profit, '￥')}</span>
            </p>
          </div>
          <div class="result-list-title">
            <span class="play">玩法</span>
            <span class="bet-amount" v-if="bet.bet_amount">投注金额</span>
            <span class="profit">盈利</span>
          </div>
          <ul class="result-list">
            {
              notification.win_notifications.map((win, index) => {
                return (
                  <li class="result" on-click={this.linkTobetrecord.bind(this, notification, win)}>
                    <span class="play">{`${index + 1}. ${win.game_name}`}</span>
                    <span class="bet-amount" v-if="win.total_bet_amount">{this.$options.filters.currency(win.total_bet_amount, '￥')}</span>
                    <span class="profit game-profit">{this.$options.filters.currency(win.total_profit, '￥')}</span>
                  </li>
                )
              })
            }
          </ul>
        </div>
      )
    },
    broadcastWinMsg () {
      let notification = this.$store.state.notification
      if (notification.length === 0) {
        this.$store.commit('HIDE_NOTIFICATION')
        return
      }

      let customClass
      switch (notification[0].type) {
        case 'win-notification-batch':
          notification = this.bachWinMsg(this.$createElement, notification[0])
          customClass = 'win-notification'
          break
        case 'win-notification':
          notification = this.winMsg(this.$createElement, notification[0])
          customClass = 'win-notification'
          break
        case 'bet-track-record-batch':
        case 'bet-track-record':
          notification = this.bettrackRecordMsg(this.$createElement, notification[0])
          customClass = 'bettrack-notification'
          break
      }

      setTimeout(() => {
        this.currentNotification = this.$notify({
          onClose: this.broadcastWinMsg,
          showClose: true,
          position: 'left',
          duration: 8000,
          message: notification,
          customClass: customClass
        })
        this.$store.dispatch('removeNotification')
      }, 1000)
    },
    closeVerifyTrialDialog () {
      this.$store.dispatch('closeTrialVerifyDialog')
      this.closeLoginDialog()
    },
    closeLoginDialog () {
      this.$store.commit('CLOSE_LOGINDIALOG')
    },
    tryplay () {
      this.$store.dispatch('trial', {
        verification_code_0: this.user.verification_code_0,
        verification_code_1: this.user.verification_code_1
      }).then((response) => {
        this.closeVerifyTrialDialog()
        this.$router.push({ name: 'Game' })
      }, errRes => {
        this.fetchCaptcha()
        this.$message({
          showClose: true,
          message: msgFormatter(errRes),
          type: 'error'
        })
      }).catch((catchedError) => {
        this.fetchCaptcha()
        this.$message({
          showClose: true,
          message: msgFormatter(catchedError),
          type: 'error'
        })
      })
    },
    closeBetRecordDialog () {
      this.$store.dispatch('updateBetRecordDialog', {visible: false, type: 'trial', schedule: null})
    },
    replaceToken () {
      let refreshToken = this.$cookie.get('refresh_token')
      if (!refreshToken || this.$store.state.user.account_type === 0) {
        return
      }
      getToken(refreshToken).then(res => {
        this.$store.dispatch('fetchJWTToken', 'eagle')
        let expires = new Date(res.expires_in)
        localStorage.setItem('token_expire', res.expires_in)
        this.$cookie.set('access_token', res.access_token, {
          expires: expires
        })
        this.$cookie.set('refresh_token', res.refresh_token, {
          expires: expires
        })
      }).catch(() => {})
      this.refreshTokenTimer = setTimeout(() => {
        this.replaceToken()
      }, 20 * 60 * 1000)
    },
    fetchCaptcha () {
      fetchCaptcha().then(res => {
        this.captcha_src = res.captcha_src
        this.user.verification_code_0 = res.captcha_val
      })
    }
  },
  computed: {
    ...mapState([
      'ws',
      'loginDialogVisible',
      'notificationVisible',
      'betRecordDialog',
      'showTrialVerifyDialog',
      'games',
      'systemConfig'
    ])
  },
  created () {
    const version = this.$route.query.desktop
    if (version === '0' && this.$cookie.desktop !== '0') {
      this.$cookie.set('desktop', version)
      window.location.reload()
    }

    this.indicator = new Indicator(() => {
      const expireTime = localStorage.getItem('token_expire')
      if (!expireTime) {
        return
      }
      const expireFromNow = this.$moment(expireTime).diff(this.$moment(), 'ms')
      clearTimeout(this.refreshTokenTimer)
      if (expireFromNow < 300000) { // 五分鐘內過期則直接刷新
        this.replaceToken()
      } else {
        this.refreshTokenTimer = setTimeout(() => {
          this.replaceToken()
        }, expireFromNow - 300000)
      }
    }, () => {

    })
  },
  beforeDestroy () {
    clearTimeout(this.refreshTokenTimer)
    clearInterval(this.getMessageInterval)
    if (this.indicator) {
      this.indicator.destroy()
    }
  },
  watch: {
    'showTrialVerifyDialog': function () {
      this.user.verification_code_1 = ''
      this.fetchCaptcha()
    },
    'notificationVisible': function (visible) {
      if (visible) {
        this.broadcastWinMsg()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'style/vars.scss';
.captcha {
  width: 70px;
  height: 32px;
}

@mixin font-style ($size, $color, $weight, $spacing) {
  font-size: $size;
  color: $color;
  @if ($weight) {
    font-weight: $weight;
  }
  @if ($spacing) {
    letter-spacing: $spacing;
  }
}

.header-block {
  position: relative;
  z-index: $z-header;
}

.main-block {
  position: relative;
  z-index: $z-main;
}

.bettrack-notification {
  width: 280px;
  .title {
    text-align: center;
    height: 40px;
    line-height: 40px;
    margin-bottom: 10px;
    @include font-style(16px, #333, 500, false)
  }
  .total-amount {
    border-top: 1px solid #ddd;
    text-align: center;
    height: 40px;
    line-height: 40px;
    @include font-style(14px, #333, 500, false)
  }
  .content {
    max-height: 385px;
    overflow-y: auto;
    .game-list {
      box-sizing: border-box;
      padding: 0 20px;
      .game-list-item {
        margin-bottom: 10px;
        .track-header {
          box-sizing: border-box;
          display: flex;
          border-bottom: 2px dashed #ddd;
          margin-bottom: 5px;
          padding-bottom: 5px;
          padding-right: 10px;
          .track-header-left {
            width: 50%;
            .name {
              @include font-style(14px, #026bb3, 500, false);
            }
            .issue {
              @include font-style(13px, #026bb3, false, .5px);
            }

          }
          .track-header-right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 50%;
            font-weight: 600;
            @include font-style(14px, $red, 600, .5px);
            &.green {
              color: $green;
            }
          }
        }
        .track-list {
          .track-list-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
            .status-field {
              display: flex;
              align-items: center;
              .ongoing {
                color: #409eff;
              }
              .win {
                color: $red;
              }
              .death,.lose {
                color: #999;
              }
              .stop {
                color: #333;
              }
            }
            .tip-icon {
              position: relative;
              top: -1px;
              box-sizing: border-box;
              width: 15px;
              height: 15px;
              color: $red;
              font-size: 12px;
              padding: 2px;
              border: 1px solid $red;
              border-radius: 50%;
              vertical-align: middle;
              cursor: pointer;
              margin-left: 5px;
            }
          }
        }
      }
    }
  }
}

.win-notification {
  width: 280px;
  max-height: 385px;
  overflow-y: auto;

  .title {
    text-align: center;
    margin-bottom: 10px;
    @include font-style(16px, #333, 500, false)
  }
  .congratulation {
    margin-bottom: 10px;
    @include font-style(14px, #4c8b04, false, false);
  }

  .game {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    padding-bottom: 5px;
    padding-right: 10px;
    .name {
      @include font-style(14px, #026bb3, 500, false);
    }
    .issue {
      @include font-style(13px, #026bb3, false, .5px);
    }
    .amount {
      @include font-style(14px,  #d0021b, false, false);
    }
    .total-text {
      @include font-style(13px,  #333, false, false);
    }
  }

  .result-list-title {
    position: relative;
    display: inline-flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    height: 25px;
    font-size: 12px;
    color: #999;
    .play {
      width: 150px;
    }
    .bet-amount, .profit {
      width: 60px;
    }
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      height: 1px;
      width: 100%;
      border-bottom: 2px dashed #ddd;
    }
  }
  .result-list {
    display: block;
    overflow-y: auto;
    max-height: 290px;
    padding-right: 10px;
    @include font-style(12px,  #666, false, false);
    .result {
      display: inline-flex;
      width: 100%;
      justify-content: space-between;
      line-height: 2.2;
      flex-wrap: wrap;
      .combination {
        width: 100%;
        padding-left: 15px;
      }
      .play {
        width: 150px;
      }
      .bet-amount, .profit{
        width: 60px;
      }
    }
    .game-profit {
      @include font-style(13px,  #026bb3, 600, false);
    }
  }
  &.batch {
    .result-list {
      .result {
        cursor: pointer;
        &:hover {
          opacity: .8;
        }
      }
    }
  }
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .7s ease;
}

</style>
