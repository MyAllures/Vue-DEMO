<template>
  <div class="skin__game-menu">
    <div class="game-menu-container">
      <ul class="game-menu p-l container block-center">
        <li
          :class="['game-menu-item', activeGame === game.id ? 'active' : '']"
          v-for="(game, index) in allGames"
          :key="game.id" v-if="index < exposedCount"
          @click="switchGame(game)">{{game.display_name}}</li>
        <li
          :class="[
            'game-menu-item',
            'additional-menu',
            'm-r-lg',
            'text-center',
            {
              'active': currentGame.index > exposedCount
            }
          ]"
          v-if="allGames.length > exposedCount">
          <span v-if="currentGame.index > exposedCount">{{currentGame.display_name}}</span>
          <span v-else>全部游戏</span>
          <i class="el-icon-arrow-up icon"/>
          <i class="el-icon-arrow-down icon"/>
          <div class="sub-game-menu">
            <SubGameMenu @handleClick="switchGame"></SubGameMenu>
          </div>
        </li>
      </ul>
    </div>
    <div class="category-menu">
      <div class="container block-center">
        <ul v-if="categories&&categories.length">
          <li
            :class="['category-menu-item',
            {'active': activeCategory===category.id+''},
            {'track': category.id === 'playpositions'}
            ]"
            v-for="(category) in categories"
            :key="'category' + category.id"
            @click="switchCategory(category)">{{category.display_name}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import style from '../style'
import SubGameMenu from './SubGameMenu.vue'
export default {
  props: {
    addition: {
      type: Array,
      default: []
    }
  },
  components: {
    SubGameMenu
  },
  data () {
    return {
      style,
      exposedCount: 11,
      isBusy: false
    }
  },
  computed: {
    activeGame () {
      return parseInt(this.$route.params.gameId)
    },
    activeCategory () {
      if (this.$route.name === 'GamePosition') {
        return 'playpositions'
      }
      if (this.$route.name === 'ExpertPlan') {
        return 'expertplan'
      }
      return this.$route.params.categoryId
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId) || {index: 0}
    },
    categories () {
      if (!this.currentGame) {
        return []
      }
      let gameId = this.$route.params.gameId
      let categories = this.$store.state.categories[gameId]
      if (!categories) {
        return []
      }
      categories = [...categories]
      if (this.addition.includes('bettrack')) {
        if (this.bettrackPositions[gameId]) {
          categories.push({
            id: 'playpositions',
            display_name: '追号'
          })
        }
      }

      if (this.addition.includes('expertplan')) {
        categories.push({
          id: 'expertplan',
          display_name: '专家计划'
        })
      }
      return categories
    },
    ...mapGetters([
      'allGames'
    ]),
    ...mapState([
      'bettrackPositions'
    ])
  },
  name: 'gamemenu',
  methods: {
    switchGame (game) {
      if (this.activeGame === game.id) {
        return
      }

      const key = game.id
      if (key === '-1') {
        return false
      }
      if (this.isBusy) {
        return false
      }
      // this.isBusy = true
      this.$store.dispatch('saveLastGame', key)
      localStorage.setItem('lastGameCode', game.code)
      this.$router.push(`/game/${key}`)
    },
    switchCategory (category) {
      if (!category || (category.id === this.activeCategory)) {
        return
      }
      const gameId = this.$route.params.gameId
      this.$store.dispatch('saveLastCategory', {gameId: gameId, categoryId: category.id})
      this.$router.push({
        path: `/game/${gameId}/${category.id}`
      })
    }
  },
  created () {
    let categoryId = this.$route.params.categoryId

    if (categoryId) {
      let selectedCategory = this.categories.find(c => (c.id + '') === this.activeCategory)
      if (!selectedCategory || this.activeCategory === 'playpositions' || this.activeCategory === 'expertplan') {
        this.$router.push({path: `/game/${this.$route.params.gameId}/`})
      }
    }
  }
}
</script>

<style scoped lang='scss'>
@import "../style/vars.scss";
.skin__game-menu {
  flex: 0 0 auto;
}
.game-menu {
  box-sizing: border-box;
  text-transform: uppercase;
}
.game-menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  display: inline-block;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  &.active {
    background: rgba(0, 0, 0, 0.3);
    cursor: default;
    &:hover {
      background: rgba(0, 0, 0, 0.3);
      cursor: default;
    }
  }
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}
.category-menu {
  text-align: center;
  height: 35px;
}
.category-menu-item {
  height: 35px;
  line-height: 35px;
  padding: 0 10px;
  display: inline-block;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  &.active {
    color: $yellow;
     cursor: default;
  }
  &.track {
    position: relative;
    &::after {
      position: absolute;
      content: '';
      display: inline-block;
      width: 28px;
      height: 15px;
      background-image: url('../assets/badge_new.svg');
      background-repeat: no-repeat;
    }
  }
}

.additional-menu {
  position: relative;
  float: right;
  color: #fff;
  font-size: 14px;
  padding: 0 20px;

  .sub-game-menu {
    display: none;
    position: absolute;
    right: 0;
    z-index: 10;
  }

  .icon {
    &.el-icon-arrow-up {
      display: none;
    }
    &.el-icon-arrow-down {
      display: inline;
    }
  }

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    .icon {
      &.el-icon-arrow-up {
        display: inline;
      }
      &.el-icon-arrow-down {
        display: none;
      }
    }
    .sub-game-menu {
      display: block;
    }
  }
}
</style>
