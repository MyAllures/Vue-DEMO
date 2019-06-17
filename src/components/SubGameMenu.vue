<template>
  <div class="container">
    <div class="group"
      v-for="(group, groupIndex) in groups"
      :key="groupIndex">
      <div class="title">{{group.name}}</div>
      <div class="wrapper">
        <span :class="['game', {'active': String(getGame(gameCode).id) === $route.params.gameId }]"
          @click="$emit('handleClick', getGame(gameCode))"
          v-for="(gameCode, gameCodeIndex) in group[KEY]"
          :key="gameCodeIndex">{{getGame(gameCode).display_name || ''}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import _ from 'lodash'
export default {
  data () {
    return {
      KEY: 'default'
    }
  },
  computed: {
    ...mapState(['games']),
    groups () {
      return _.chain(this.games).map('group_tag').uniqBy('name').sortBy('rank').value()
    }
  },
  methods: {
    getGame (code) {
      return _.find(this.games, game => game.code === code) || {}
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  flex-wrap: wrap;
  width: 760px;
  height: 300px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.2);
}

.group {
  display: inline-block;
  box-sizing: border-box;
  width: 90px;
  text-align: left;
  margin-bottom: 10px;
  padding: 5px;
  &:hover {
    .title {
      border-color: #333;
    }
  }
}

.title {
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #bfbfbf;
  height: 25px;
  line-height: 25px;
  margin-bottom: 5px;
}

.game {
  display: block;
  font-size: 12px;
  color: #999;
  height: 25px;
  line-height: 25px;
  cursor: pointer;
  &:hover {
    color: #000;
    opacity: .8;
  }
  &.active {
    opacity: 1;
    cursor: default;
  }
}
</style>
