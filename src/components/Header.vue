<template>
  <div class="header skin__header">
    <div :class="['topbar', {home: $route.path === '/'}]">
      <TopBar/>
    </div>
    <div :class="['bottomnavs', isUserPage ? 'lower' : '']">
      <div class="navs container block-center">
        <Logo/>
        <GameResult :gameCode="gameCode"
          v-if="gameCode && $route.path.indexOf('/game/') >= 0"/>
        <NavMenu :menus="isUserPage ? showUserMenus : normalMenus" />
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '../components/TopBar'
import NavMenu from '../components/NavMenu'
import Logo from '../components/Logo'
import GameResult from '../components/GameResult'

export default {
  data () {
    return {
      menus: [{
        name: this.$t('navMenu.game_center'),
        path: '/game',
        eng: 'LOBBY'
      }, {
        name: this.$t('navMenu.promotion'),
        path: '/promotions',
        eng: 'PROMOTION'
      }, {
        name: this.$t('navMenu.qa'),
        path: '/faq',
        eng: 'FAQ'
      }, {
        name: this.$t('navMenu.affliate'),
        path: '/agent',
        eng: 'AGENT'
      }],
      userMenus: [
        {
          name: this.$t('navMenu.game_center'),
          path: '/game'
        },
        {
          name: this.$t('navMenu.game_intro'),
          path: '/gameintro'
        }, {
          name: this.$t('navMenu.draw_history'),
          path: '/gamehistory'
        }, {
          name: this.$t('navMenu.promotion'),
          path: '/promotions'
        }]
    }
  },
  components: {
    TopBar,
    NavMenu,
    Logo,
    GameResult
  },
  computed: {
    gameCode () {
      let game = this.$store.getters.gameById(this.$route.params.gameId)
      return game ? game.code : ''
    },
    isUserPage () {
      let pat = new RegExp(/\/game\/|\/game|\/account\/|\/gamehistory|\/gameintro/)
      return pat.test(this.$route.path)
    },
    isGamePage () {
      let path = this.$route.path.split('/')
      if (path[1] === 'game') {
        return true
      }
    },
    normalMenus () {
      let menus = this.menus
      if (this.$store.state.systemConfig.isAdvanced) {
        menus = menus.filter(page => page.path !== '/agent')
      }
      return menus
    },
    showUserMenus () {
      let accountType = this.$store.state.user.account_type
      if (accountType === 0) {
        return this.userMenus.filter(page => page.path !== '/account')
      } else {
        return this.userMenus
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
}
.topbar {
  display: inline-block;
  height: 40px;
  width: 100%;
  background-color: #f9f9f9;
}
.bottomnavs {
  width: 100%;
  height: 100px;
  background-color: #fff;
  .navs {
    height: 100%;
    &:after {
      content: '';
      display: block;
      height: 20px;
    }
  }
  &.lower {
    height: 60px;
    /deep/ .logo img {
      max-height: 50px;
    }
  }
}
</style>
