<template>
  <div>
    <header>
      <el-row class="row-bg">
        <div class="container block-center">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{$t('navMenu.personal_account')}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </el-row>
    </header>
    <el-container class="container no-border block-center">
      <div class="aside m-r-sm">
        <AsideMenu v-show="user.onlinePaymentTypes && user.onlinePaymentTypes.length" @clicked="onClickChild" :items="menus" :defaultActive="currentPath" />
        <AsideMenu v-show="!(user.onlinePaymentTypes && user.onlinePaymentTypes.length)" @clicked="onClickChild" :items="noOnlinePayMenus" :defaultActive="currentPath" />
      </div>
      <div :class="['main', 'm-b-xlg', {'background-clear': $route.name === 'PersonalOverview'}]">
        <router-view/>
      </div>
    </el-container>
  </div>
</template>

<script>
import 'vue-awesome/icons/credit-card'
import 'vue-awesome/icons/arrow-circle-right'
import 'vue-awesome/icons/file'
import 'vue-awesome/icons/list-ul'
import 'vue-awesome/icons/user'
import 'vue-awesome/icons/envelope'
import 'vue-awesome/icons/bullhorn'
import 'vue-awesome/icons/sitemap'
import 'vue-awesome/icons/user-friends'
import '@/components/icon/personal-report'
import '@/components/icon/betrecord'

import urls from '@/api/urls'
import style from '@/style'
import Vue from 'vue'
import AsideMenu from '@/components/AsideMenu'

export default {
  name: 'Account',
  components: {
    AsideMenu
  },
  data () {
    const menus = [
      {
        display_name: '帐号总览',
        route: '/account/overview',
        leftIcon: 'sitemap'
      },
      {
        display_name: '帐号资讯',
        route: '/account/my',
        leftIcon: 'user'
      },
      {
        display_name: '我的关注',
        route: '/account/followees',
        leftIcon: 'user-plus',
        marginBottom: '6px'
      },
      {
        display_name: '我的推荐',
        route: '/account/referrals',
        leftIcon: 'user-friends',
        marginBottom: '6px',
        condition: 'referrals',
        badge: 'referrals'
      },
      {
        display_name: this.$t('user.online_payment'),
        route: '/account/online_payment',
        leftIcon: 'credit-card'
      },
      {
        display_name: this.$t('user.remit'),
        route: '/account/remit',
        leftIcon: 'arrow-circle-right'
      },
      {
        display_name: this.$t('user.withdraw'),
        route: '/account/withdraw',
        leftIcon: 'file'
      },
      {
        display_name: this.$t('user.finance'),
        route: '/account/finance',
        leftIcon: 'list-ul'
      },
      {
        display_name: this.$t('user.betrecord'),
        route: '/account/bet_record',
        leftIcon: 'betrecord'
      },
      {
        display_name: this.$t('user.personal_report'),
        route: '/account/personal_report',
        leftIcon: 'personal-report',
        marginBottom: '8px'
      },
      {
        display_name: this.$t('user.message'),
        route: '/account/message',
        leftIcon: 'envelope'
      },
      {
        display_name: this.$t('user.announcement'),
        route: '/account/announcement',
        leftIcon: 'bullhorn'
      }
    ]

    const noOnlinePayMenus = menus.filter(item => item.route !== '/account/online_payment')

    return {
      style,
      formSrc: urls.payment,
      token: Vue.cookie.get('access_token'),
      menus,
      noOnlinePayMenus
    }
  },
  mounted () {
    this.$store.dispatch('actv2/fetchActReCount')
  },
  methods: {
    onClickChild (e) {
      this.$router.push(e.route)
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    currentPath () {
      const path = this.$route.path
      const paths = path.split('/')
      if (paths.length > 3) {
        return `/${paths[1]}/${paths[2]}`
      } else {
        return path
      }
    }
  },
  watch: {
    $route: function (to, from) {
      if (to.name === 'Account') {
        this.$router.push({ name: 'MyAccount' })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../../style/vars.scss";
@import "../../style/base.scss";
.aside {
  display: inline-block;
  vertical-align: top;
  margin-bottom: 10px;
}

.main {
  display: inline-block;
  box-sizing: border-box;
  width: $main_width;
  min-height: 50vh;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  padding: 10px 20px;
  @extend %text;
}

.background-clear {
  background-color: transparent;
  box-shadow: none;
  padding: 0;
}

.el-main {
  margin-left: 20px;
  background: #fff;
}
</style>


