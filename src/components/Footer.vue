<template>
  <div :class="['skin__footer footer text-center', {mask: systemConfig.theme!=='default-theme'}]">
    <div class="quick-info">
      <div :class="['sub-menu', 'm-b-xlg']">
        <router-link class="link"
          v-for="(item, index) in showSubMenu"
          :key="index"
          :to="item.route">{{item.option}}</router-link>
        <a href="#" class="link" @click="navigateToMobile()">手机版</a>
        <a v-if="appDownloadUrl" :href="appDownloadUrl" class="link" target="_blank">APP 下载</a>
      </div>
      <div class="advice block-center">
        <div
          class="footer-icon"
          :style="{'background-image': `url('${themeSrc}')`}">
        </div>
        <div class="footer-text">
          <p>理性购彩，未满 18 周岁未成年人禁止购彩及兑奖</p>
          <p>健康游戏忠告：抵制黑平台不良游戏，拒绝盗版小平台游戏。注意自我保护，谨防受骗上当。</p>
          <p>温馨提示您适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
const subMenu = [
  {
    option: '存款取款',
    route: '/account/online_payment'
  },
  {
    option: '常见问题',
    route: '/faq/faqs'
  },
  {
    option: '规则说明',
    route: '/gameintro'
  },
  {
    option: '加盟合作',
    route: '/agent/agent_register'
  },
  {
    option: '关于我们',
    route: '/faq/about'
  },
  {
    option: '最新优惠',
    route: '/promotions'
  }
]
export default {
  name: 'bottom',
  methods: {
    navigateToMobile () {
      if (this.mobileLinkUrl) {
        window.location.assign(this.mobileLinkUrl)
      } else {
        this.$cookie.set('desktop', 0)
        window.location.reload()
      }
    }
  },
  computed: {
    ...mapState([
      'systemConfig'
    ]),
    mobileLinkUrl () {
      return this.systemConfig.mobileLinkUrl
    },
    appDownloadUrl () {
      return this.systemConfig.appDownloadUrl
    },
    notHomePage () {
      return this.$route.name !== 'Home'
    },
    showSubMenu () {
      const onlinePaymentTypes = this.$store.state.user.onlinePaymentTypes
      if (onlinePaymentTypes && onlinePaymentTypes.length) {
        subMenu[0].route = '/account/online_payment'
      } else {
        subMenu[0].route = '/account/remit'
      }
      return subMenu
    },
    themeSrc () {
      if (this.systemConfig.theme !== 'default-theme') {
        return require('../assets/plus18_white.png')
      } else {
        return require('../assets/plus18_black.png')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/vars.scss';
.footer {
  position: relative;
  .quick-info {
    height: 200px;
  }

  .sub-menu {
    padding-top: 35px;
    .link {
      padding: 0 20px;
      border-right: 1px solid;
      font-size:  14px;
      line-height: 1;
      color: #666;
      &:last-child {
        border: none
      }
      &:hover {
        color: $primary
      }
    }
  }

  .advice {
    font-size:  12px;
    line-height: 1.8;
    height: 60px;
    width: 580px;
    text-align: center;
    color: #999;
    .footer-icon {
      float: left;
      margin-right: 20px;
      width: 60px;
      height: 60px;
      background-repeat: no-repeat;
      background-size: contain;
    }
    .footer-text {
      float: left;
      text-align: left;
    }
  }

  &.mask {
    .quick-info {
      height: 234px;
    }
    .advice {
      color: #fff;
    }
    .copyright  {
      background-color: rgba(46, 46, 46, 0.7);
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      .text {
        color: #fff;
      }
    }
  }
}
</style>
