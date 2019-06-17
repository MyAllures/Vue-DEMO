<template>
  <div class="skin__tabs tabs">
    <div :class="['tab', 'text-center', `is-${type}`, {'active': item.key === activeTab}]"
      v-for="(item, index) in items"
      :key="index"
      @click="switchTab(item)">
      <span :class="['tab-text', {'active': item.key === activeTab}]">
        {{item.label}}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    items: {
      type: Array
    },
    type: {
      type: String,
      default: 'box',
      validator: (val) => ['box', 'text'].includes(val)
    }
  },
  data () {
    return {
      activeTab: this.items[0].routename ? this.$route.name : this.items[0].key
    }
  },
  watch: { // for tabs that control router
    '$route.name': function () {
      if (this.items[0].routename) {
        this.activeTab = this.$route.name
      }
    }
  },
  methods: {
    switchTab (e) {
      this.activeTab = e.key
      this.$emit('clicked', e)
    },
    setActiveTab (val) {
      this.activeTab = val
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../style/vars.scss";
.tab {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  .tab-text {
    color: #9b9b9b;
    &.active {
      color: currentColor;
      cursor: default;
    }
  }

  &.is-box {
    border: solid 1px #cbcbcb;
    background-color: #fff;
    margin-right: -1px;
    margin-left: -1px;
    padding: 0 15px;
    &.active {
      .tab-text {
        color: #fff;
      }
    }
  }
  &.is-text {
    .tab-text {
      font-size: 13px;
    }
    &:not(:last-child) {
      &::after {
        content: '';
        display: inline-block;
        width: 1px;
        height: 10px;
        background-color: #ddd;
        vertical-align: middle;
        margin-left: 10px;
        margin-right: 10px;
      }
    }
    &.active {
    }
  }
}
</style>


