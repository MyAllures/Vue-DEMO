<template>
  <el-row class="row-bg">
    <div class="container block-center">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{$t('navMenu.game_intro')}}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-row class="rules-container">
        <div class="aside">
          <AsideMenu @clicked="onClickChild" :items="allGames || []" :defaultActive="active"/>
        </div>
        <div class="main rules-content m-b-xlg">
          <h1 class="rules-main-title m-b-lg">{{currentGame.display_name}}</h1>
          <h2 class="rules-sub-title" v-if="currentPlaySettings && currentPlaySettings.length">{{$t('gameIntro.gameinfo')}}</h2>
          <el-table v-if="currentPlaySettings && currentPlaySettings.length" class="m-b-lg" v-loading="loading" :data="currentPlaySettings" stripe>
            <el-table-column :label="''" prop="display_name">
            </el-table-column>
            <el-table-column :label="$t('gameIntro.odds')" prop="odds">
            </el-table-column>
            <el-table-column :label="$t('gameIntro.return_rate')" prop="return_rate">
            </el-table-column>
            <el-table-column :label="$t('gameIntro.min_per_bet')">
              <template slot-scope="scope">
                <span>{{ scope.row.min_per_bet | currency('￥')}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('gameIntro.max_per_bet')">
              <template slot-scope="scope">
                <span>{{ scope.row.max_per_bet | currency('￥')}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('gameIntro.max_per_draw')">
              <template slot-scope="scope">
                <span>{{ scope.row.max_per_draw | currency('￥')}}</span>
              </template>
            </el-table-column>
          </el-table>
          <h2 class="rules-sub-title">{{$t('gameIntro.rule')}}</h2>
          <component :is="currentGame.code" :gameName="currentGame.display_name"></component>
        </div>
      </el-row>
    </div>
  </el-row>
</template>

<script>
  import {
    fetchPlaySetting
  } from '../../api'

  import AsideMenu from '../../components/AsideMenu'
  import _ from 'lodash'
  import { mapGetters } from 'vuex'
  export default {
    name: 'gameIntros',
    components: {
      AsideMenu
    },
    data () {
      return {
        currentGame: {},
        currentPlaySettings: [],
        loading: false
      }
    },
    created () {
      if (this.allGames.length > 0) {
        this.chooseGame()
      } else {
        const unwatch = this.$watch('allGames', function (allGames) {
          this.chooseGame()
          unwatch()
        })
      }
    },
    computed: {
      ...mapGetters([
        'allGames'
      ]),
      active () {
        // the second judgement is for the page refresh condition
        if (!this.currentGame.index) {
          return '0'
        } else {
          return this.currentGame.index - 1 + ''
        }
      }
    },
    watch: {
      'currentGame': function () {
        this.fetchPlaySetting()
      }
    },
    methods: {
      chooseGame () {
        let lastGame = this.$store.state.lastGameData.lastGame
        if (lastGame) {
          this.currentGame = this.$store.getters.gameById(lastGame + '')
        } else {
          this.currentGame = this.allGames[0]
        }
      },
      fetchPlaySetting () {
        this.currentPlaySettings = []
        this.loading = true

        fetchPlaySetting(this.currentGame.id).then(playSettings => {
          _.each(playSettings, (item) => {
            item.return_rate = item.return_rate + '%'
          })
          this.currentPlaySettings = playSettings
          this.loading = false
        }, () => {
          this.loading = false
        })
      },
      onClickChild (e) {
        this.currentGame = _.find(this.allGames, item => {
          return item.code === e
        })
        this.$store.dispatch('saveLastGame', this.currentGame.id)
      }
    }
  }
</script>

<style lang="scss">
@import "../../style/vars.scss";
@import "../../style/base.scss";
$common-pixel: 10px !default;
$title-size: 18px !default;
$title-color: black !default;

.aside {
  display: inline-block;
  vertical-align: top;
}
.main.rules-content {
  display: inline-block;
  box-sizing: border-box;
  width: $main_width;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  padding: 40px;
  @extend %text;
}
.rules-main-title {
  font-size: $title-size;
  color: $title-color;
}
.rules-sub-title {
  margin-bottom: $common-pixel;
  color: $title-color;
}
.rules-container {
  height: 100%;
  min-height: 100vh;
}
.rule-details {
  $lg: $common-pixel * 2 !default;
  $sm: $common-pixel * 1/2 !default;
  .warn {
    color: $watermelon;
  }
  ul {
    margin: $sm auto;
  }
  li {
    margin: $sm 0;
    list-style: initial;
    margin-left: $lg;
  }
}

</style>
