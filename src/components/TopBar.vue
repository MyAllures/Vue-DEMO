<template>
  <div class="skin__top-bar top-bar container block-center">
    <div class="clock p-l">
      {{nowTime}}
    </div>
    <div>
      <ul class="account-links" v-if="!$store.state.user.account_type">
        <span class="greet-money" v-if="parseInt(regPresentAmount)">
          现在注册立领{{regPresentAmount | currency('￥', 0)}} 红包
        </span>
        <li>
          <router-link to="/register" class="link">
            <span class="primary-btn">
              {{$t('navMenu.register_now')}}
            </span>
          </router-link>
        </li>
        <li v-if="logined===false">
          <a id="login-link" @click="login" class="link">{{$t('navMenu.user_login')}}</a>
        </li>
        <li v-if="logined===false">
          <a class="red link" @click="trial">{{$t('navMenu.try_play')}}</a>
        </li>
        <li v-if="logined===true">
          欢迎, {{$t('user.visitor')}}
        </li>
        <li v-if="logined===true">
          <a class="link" @click="logout()">退出试玩</a>
        </li>
        <li v-if="logined===true">
          <a class="link" @click="openBetRecordDialog">我的注单</a>
        </li>
      </ul>

      <ul v-else class="account-links">
        <li>
          <router-link :to="paymentPage" class="link">
            <icon class="link-icon" name="credit-card"></icon>
            立即存款
          </router-link>
        </li>
        <li>
          <router-link to="/account/bet_record" class="link">
            <icon class="link-icon" name="list-ul"></icon>
            我的注单
          </router-link>
        </li>
        <li>
          <span :class="['account-trigger', { 'active': showDropdown }]"
            @mouseenter="showDropdown=true"
            @mouseleave="showDropdown=false">
            <span @click="$router.push({name: 'PersonalOverview'})">
              <span class="username">欢迎, {{user.username}}</span>
              <span v-if="messageCount" class="msg-tooltip m-l-sm">{{messageCount}}</span>
            </span>
            <i class="el-icon-caret-bottom" v-if="!showDropdown" />
            <i class="el-icon-caret-top" v-else />
            <ul v-show="showDropdown" class="dropdown" >
              <li>
                <router-link to="/account/overview">
                  <icon name="sitemap"></icon>帐号总览
                </router-link>
              </li>
              <li>
                <router-link to="/account/my/primary_info">
                  <icon name="user"></icon>{{$t('user.my_account')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/followees">
                  <icon name="user-plus"></icon>我的关注
                </router-link>
              </li>
              <li>
                <router-link to="/account/referrals" v-if="referralEnabled">
                  <icon name="user-friends"></icon>我的推荐
                </router-link>
              </li>
              <li v-if="user.onlinePaymentTypes&&user.onlinePaymentTypes.length">
                <router-link to="/account/online_payment">
                  <icon name="credit-card"></icon>{{$t('user.online_payment')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/remit">
                <icon name="arrow-circle-right"></icon>{{$t('user.remit')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/withdraw">
                  <icon name="file"></icon>{{$t('user.withdraw')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/finance/payment_record">
                  <icon name="list-ul"></icon>{{$t('user.finance')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/bet_record/settled">
                  <icon name="betrecord"></icon>{{$t('user.betrecord')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/personal_report">
                  <icon name="personal-report"></icon>{{$t('user.personal_report')}}
                </router-link>
              </li>
              <li>
                <router-link to="/account/message">
                  <icon name="envelope"></icon>{{$t('user.message')}}<span v-if="messageCount" class="msg-tooltip-right">{{messageCount}}</span>
                </router-link>
              </li>
              <li>
                <router-link to="/account/announcement">
                  <icon name="bullhorn"></icon>{{$t('user.announcement')}}
                </router-link>
              </li>
              <li @click="logout()">
                <a>
                  <icon name="sign-out-alt"></icon>{{$t('navMenu.logout')}}
                </a>
              </li>
            </ul>
          </span>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import 'vue-awesome/icons/credit-card'
import 'vue-awesome/icons/arrow-circle-right'
import 'vue-awesome/icons/list-ul'
import 'vue-awesome/icons/file'
import 'vue-awesome/icons/user'
import 'vue-awesome/icons/envelope'
import 'vue-awesome/icons/sign-out-alt'
import 'vue-awesome/icons/sitemap'
import 'vue-awesome/icons/user-friends'
import '@/components/icon/personal-report'
import '@/components/icon/betrecord'

import { mapState } from 'vuex'

export default {
  name: 'TopBar',
  data () {
    return {
      username: '',
      password: '',
      showDropdown: false,
      nowTime: new Date().toLocaleString()
    }
  },
  methods: {
    login () {
      this.$store.commit('SHOW_LOGIN_DIALOG')
    },
    logout () {
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/')
      })
    },
    trial () {
      this.$store.dispatch('trial').then((response) => {
        this.$router.push({ name: 'Game' })
        this.sendGaEvent({action: '試玩', category: '遊客'})
      })
    },
    openBetRecordDialog () {
      this.$store.dispatch('updateBetRecordDialog', {visible: true, type: 'normal'})
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('actv2', {
      referralEnabled: state => state.referral.enabled
    }),
    logined () {
      return this.user.logined
    },
    messageCount () {
      let count = this.$store.state.messageCount
      if (!count || count < 1) {
        return 0
      }
      return count > 99 ? '99+' : count
    },
    regPresentAmount () {
      return this.$store.state.systemConfig.regPresentAmount
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
    '$route.path': function (path) {
      let pat = new RegExp(/\/game\/|\/game|\/account\/|\/gamehistory|\/gameintro/)
      if (pat.test(path)) {
        this.showDropdown = false
      }
    }
  },
  created () {
    this.timing = setInterval(() => {
      let now = new Date()
      this.nowTime = now.toLocaleString()
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timing)
  }
}
</script>
<style scoped lang='scss'>
@import '../style/vars.scss';

.top-bar {
  position: relative;
  display: flex;
  justify-content: space-between;
  height: 40px;
  line-height: 40px;
  background: rgba(0, 0, 0 ,0);
  .fa-icon {
    vertical-align: middle;
    margin: 0 3px 3px 0;
    color: #999;
  }
}

.clock {
  display: inline-block;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.account-links {
  display: inline;
  font-size: 14px;
  .link {
    color: #999;
    padding-right: 5px;
  }

  li {
    display: inline-block;
    cursor: pointer;
  }
   a {
    text-decoration: none;
    &.red {
      font-size: 14px;
      color: $azul;
    }
  }
  .dropdown {
    border: 1px solid #f2f2f2;
    padding: 5px 0;
    text-align: left;
    position: absolute;
    top: 39px;
    right: 0;
    border-top: none;
    background: #fff;
    width: 160px;
    z-index: 10;
    .fa-icon {
      width: 20px;
      margin-right: 5px;
      color: #999;
    }
    li {
      display: block;
      position: relative;
      cursor: pointer;
      line-height: 36px;
      padding: 0 10px;
      a {
        color: #999;
        display: block;
      }
      &:hover {
        a {
          color: #fff;
          .fa-icon {
            color: #fff;
          }
        }
      }
    }
  }
}

.username {
  font-weight: 500;
}


.account-trigger {
  display: block;
  cursor: pointer;
  padding: 0 10px;
  &.active {
    padding-bottom: 1px;
  }
}

.msg-tooltip {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: $red;
  color: #fff;
  font-size: 11px;
  border-radius: 4px;
}

.msg-tooltip-right {
  position: absolute;
  width: 20px;
  height: 20px;
  line-height: 20px;
  background: $red;
  top: 8px;
  right: 5px;
  font-size: 11px;
  border-radius: 4px;
  text-align: center;
  color: #fff;
}

.version-trigger {
  margin: 10px;
}

.primary-btn {
  border-radius: 3px;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 8px;
  padding-bottom: 8px;
  text-align: center;
  font-size: 14px;
}
</style>


