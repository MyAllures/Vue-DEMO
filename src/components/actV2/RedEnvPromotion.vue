<template>
  <CustomDialog :visible="type.length > 0" @hide="hide" :backClose="true">
    <div class="re-dialog" v-if="type">
      <div class="dialog-inner">
        <a class="close" href="#" @click.prevent="hide"><i class="el-icon-close"></i></a>
        <a class="back" href="#" @click.prevent="content = 'main'" v-if="!isMain"><img src="../../assets/red-envelope-v2/icon-back.svg" /> 活动规则</a>
        <div class="content-wrap">
          <template v-if="act">
            <div class="promo-title">{{ act.name }}</div>
            <PromotionMain :type="type" :act="act" v-if="isMain" />
            <BoostRedEnv :act="act" :openedData="openedRedEnv" :reLoading="reLoading" @remain="getRedEnvRemain" @goto="goto" v-else-if="content === 'boost'" />
            <ReferralLink :act="act" v-else-if="content === 'referral'" />
          </template>
          <template v-else>
            <i class="el-icon-loading"></i>
          </template>
        </div>
        <div class="footer" v-if="act">
          <template v-if="user.account_type">
            <div class="f-col single">
              <template v-if="type === 'boost'">
                <button @click="content = 'boost'" v-if="isMain">查看我的返利紅包</button>
                <button @click="openRedEnv" :disabled="reLoading || !redEnvRemain" v-else><i class="el-icon-loading" v-if="reLoading"></i>拆红包</button>
              </template>
              <template v-else-if="type === 'referral'">
                <button @click="content = 'referral'" v-if="isMain">立即推荐好友</button>
                <button @click="goto('/account/referrals')" v-else>查看我的推荐</button>
              </template>
            </div>
          </template>
          <template v-else>
            <div class="f-col login">
              <p>已有帐号</p>
              <button @click="login">立即登录</button>
            </div>
            <div class="f-col register">
              <p>尚未注册</p>
              <button @click="goto('/register')">免费注册</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </CustomDialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import CustomDialog from '@/components/CustomDialog'
import PromotionMain from './content/PromotionMain'
import BoostRedEnv from './content/BoostRedEnv'
import ReferralLink from './content/ReferralLink'
import { openActRe } from '@/api'

export default {
  name: 'RedEnvPromotion',
  props: {
    defaultContent: String,
    type: String
  },
  components: {
    CustomDialog,
    PromotionMain,
    BoostRedEnv,
    ReferralLink
  },
  data: () => ({
    content: '',
    reLoading: false,
    redEnvRemain: false,
    openedRedEnv: null
  }),
  mounted () {
    this.content = this.defaultContent || 'main'
  },
  methods: {
    ...mapActions('actv2', [
      'getAct'
    ]),
    goto (path) {
      this.hide()
      this.$router.push(path)
    },
    login () {
      this.hide()
      this.$store.commit('SHOW_LOGIN_DIALOG')
    },
    hide () {
      this.$emit('hide')
      this.content = 'main'
    },
    getRedEnvRemain (data) {
      this.redEnvRemain = data
    },
    openRedEnv () {
      this.reLoading = true
      this.$nextTick(() => {
        openActRe('engagement_boost').then(response => {
          this.openedRedEnv = response
          this.reLoading = false
        })
      })
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('actv2', {
      actBoost: state => state.boost.detail,
      actReferral: state => state.referral.detail
    }),
    act () {
      const pairs = {
        boost: this.actBoost,
        referral: this.actReferral
      }
      return pairs[this.type]
    },
    isMain () {
      return this.content === 'main'
    }
  },
  watch: {
    type (type) {
      if (type && !this.act) {
        this.getAct(type)
      }
    },
    content (val) {
      if (val === 'main') {
        this.reLoading = false
        this.openedRedEnv = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#re-promotion {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}

.re-dialog {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  padding: 10px;
  width: 610px;
  height: 600px;
  background: #b84b46;
  border-radius: 10px;
  box-sizing: border-box;
  z-index: 1;
}
.dialog-inner {
  background: #fff4df;
  margin-top: 10px;
  height: calc(100% - 10px);
  position: relative;
  border-radius: 7px;

  &:before {
    content: '';
    display: block;
    background: #fff4df;
    width: 92%;
    height: 10px;
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    margin: auto;
    border-radius: 10px 10px 0 0;
  }
}
.back {
  position: absolute;
  top: 30px;
  left: 40px;
  color: #c99f64;
  font-size: 14px;
  line-height: 1;

  &:hover {
    opacity: .8;
  }
  img {
    vertical-align: middle;
  }
}
.close {
  position: absolute;
  top: -35px;
  right: -30px;
  color: #FFF;
  font-size: 16px;
}
.content-wrap {
  padding: 15px 30px 0;
  font-size: 14px;
  text-align: center;
  height: calc(100% - 70px);
  box-sizing: border-box;
}
/deep/ {
  .content {
    height: calc(100% - 62px);
    overflow-y: auto;
    position: relative;
  }
  .promo-title {
    width: 252px;
    height: 47px;
    background: url(../../assets/red-envelope-v2/promotion-title.png) no-repeat;
    background-size: 252px 47px;
    margin: 0 auto 15px;
    font-size: 20px;
    color: #fae8c6;
    line-height: 47px;
  }
  .section {
    margin-bottom: 15px;

    table {
      width: 100%;

      thead {
        font-size: 12px;

        td {
          border-top-color: transparent;
          border-right-color: transparent;
          border-left-color: transparent;
          padding-bottom: 2px;
        }
      }
      td {
        text-align: center;
        vertical-align: middle;
        border: solid 1px #e1cfaf;
        line-height: 22px;
      }
    }
  }
  .section-title {
    font-size: 16px;
    color: #c19353;
    margin-bottom: 10px;
    display: inline-block;
    line-height: 23px;
    position: relative;

    &:before,
    &:after {
      content: '';
      display: block;
      width: 62px;
      height: 9px;
      background: url(../../assets/red-envelope-v2/promotion-section.png) no-repeat;
      background-size: 62px 9px;
      position: absolute;
      top: calc((23px - 9px) / 2);
    }
    &:before {
      left: -72px;
      transform: rotate(180deg);
    }
    &:after {
      right: -72px;
    }
  }
  .section-content {
    background: #fae8c6;
    color: #6d6452;
    padding: 8px 12px;
    text-align: left;
    border-radius: 4px;

    &.no-background {
      background-color: transparent;
    }
  }
}
.footer {
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;

  .f-col {
    flex: 0 0 150px;

    &.single {
      flex: 0 0 200px;
    }
  }
  div {
    text-align: center;

    &.login,
    &.register {
      margin-top: -18px;
    }
    &.login {
      margin-right: 6px;
    }
    &.register {
      margin-left: 6px;
    }
    p {
      font-size: 12px;
      color: #c99f64;
    }
    button {
      display: block;
      width: 100%;
    }
  }
  button {
    padding: 10px;
    font-size: 16px;
    font-family: inherit;
    text-align: center;
    color: #f3cda0;
    background: #df4238;
    border: none;
    border-radius: 4px;
    outline: none;
    cursor: pointer;

    &[disabled] {
      background: #d6d6d6;
      color: #FFF;
      cursor: default;
    }
    i {
      margin-right: 5px;
    }
 }
}

.re-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(#000, .5);
}

.delay-out-leave-active {
  transition: all .3s ease-out;
}
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all .3s ease-out;
}
.fade-up-enter {
  transform: translateY(10px);
  opacity: 0;
}
.fade-up-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
