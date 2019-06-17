<template>
  <el-row class="row-bg">
    <div class="container block-center">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{$t('navMenu.draw_history')}}</el-breadcrumb-item>
        <el-breadcrumb-item>{{breadcrumb}}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="history-container">
        <div class="aside">
          <AsideMenu @clicked="onClickChild" :items="games" :defaultActive="asideMenuActiveItem"/>
        </div>
        <div class="main">
          <el-tabs v-model="activeTab" class="indented-tab" type="card" @tab-click="handleTypeTabClick">
            <el-tab-pane v-for="(tab, index) in typeTabs"
              :key="index"
               :label="tab.label"
               :name="tab.name"></el-tab-pane>
           </el-tabs>
           <router-view :key="$route.path" :gameCode="gameCode"></router-view>
        </div>
      </div>
    </div>
  </el-row>
</template>

<script>
import AsideMenu from '../../components/AsideMenu.vue'
import { mapGetters } from 'vuex'
import '../../style/resultsball.scss'
import {findIndex} from 'lodash'
import {GAMES_TYPES_MAP} from '@/utils/trendingDiagram.js'

export default {
  name: 'GameHistory',
  data () {
    return {
      games: [],
      typeTabs: [],
      activeTab: this.$route.path,
      breadcrumb: ''
    }
  },
  methods: {
    handleTypeTabClick (tab, event) {
      if (tab.name === 'trending_position') {
        this.sendGaEvent({category: '開獎走勢/datachart', action: '點擊', label: `位置走勢/locationchart`})
      } else if (tab.name === 'trending_number') {
        this.sendGaEvent({category: '開獎走勢/datachart', action: '點擊', label: `號碼走勢/numberchart`})
      } else if (tab.name === 'trending_sum') {
        this.sendGaEvent({category: '開獎走勢/datachart', action: '點擊', label: `總和走勢/numberchart`})
      }

      this.$router.push(`${tab.name}`)
    },
    onClickChild (e) {
      this.$router.push({name: 'Schedules', params: {gameCode: e}})
    },
    initGame () {
      this.games = this.allGames.map((game) => {
        return {
          display_name: game.display_name,
          code: game.code
        }
      })

      if (!this.gameCode) {
        const gameCode = localStorage.getItem('lastGameCode') || this.allGames[0].code
        this.$router.replace(`/gamehistory/${gameCode}/schedules`)
      }
    }
  },
  components: {
    AsideMenu
  },
  watch: {
    'allGames': {
      handler () {
        this.initGame()
      },
      immediate: true
    },
    '$route': {
      handler (route) {
        let path = route.path

        if (path.includes('schedules')) {
          this.activeTab = 'schedules'
          this.breadcrumb = '历史开奖'
        }
        if (path.includes('trending_number')) {
          this.activeTab = 'trending_number'
          this.breadcrumb = '号码走势'
        }
        if (path.includes('trending_position')) {
          this.activeTab = 'trending_position'
          this.breadcrumb = '位置走势'
        }
        if (path.includes('trending_sum')) {
          this.activeTab = 'trending_sum'
          this.breadcrumb = '总和走势'
        }
      },
      immediate: true
    },
    'gameCode': {
      handler () {
        const trendingTabs = GAMES_TYPES_MAP[this.gameCode] || []
        let tabs = [
          {
            label: '历史开奖',
            name: 'schedules'
          }
        ]
        tabs.push(...trendingTabs)
        this.typeTabs = tabs
      },
      immediate: true
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    asideMenuActiveItem () {
      return findIndex(this.games, (game) => game.code === this.gameCode) + ''
    },
    gameCode () {
      return this.$route.params.gameCode
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../style/vars.scss";

.history-container {
  height: 100%;
  min-height: 100vh;
  .aside, .main {
    display: inline-block;
  }
  .aside {
    vertical-align: top;
  }
  .main {
    box-sizing: border-box;
    width: $main_width;
    background-color: #fff;
    padding: 10px;
  }
}
</style>
