<template>
  <div class="filter-group">
    <div class="header">
      {{group.tag}}
      <span @click="handleSelect" :class="['btn', {disabled}]">{{hasActived?'清除全部':'全选'}}</span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'GameFilterGroup',
  props: {
    group: Object,
    filters: Object,
    disabled: Boolean
  },
  computed: {
    hasActived () {
      return this.group.games.some(game => {
        return this.filters[game.code]
      })
    }
  },
  methods: {
    handleSelect () {
      if (this.disabled) {
        return
      }
      this.$emit('update', {
        games: this.group.games,
        status: !this.hasActived
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-group {
  margin-bottom: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 35px;
  font-weight: 500;
  .btn {
    display: inline-block;
    padding: 0 5px;
    height: 35px;
    line-height: 35px;
    cursor: pointer;
    &.disabled {
      cursor: not-allowed;
    }
  }
}
</style>
