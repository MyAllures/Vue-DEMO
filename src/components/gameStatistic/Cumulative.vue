<template>
  <div class="cumulative" v-if="cumulative.length">
    <div class="cumulative-title">今天累计</div>
    <div class="cumulative-types-container">
      <div v-for="(item, index) in cumulative" class="type" :key="index">
        <span :class="['cumulative-label', item.key]">{{item.text}}: {{item.value}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['cumulative']
}
</script>

<style lang="scss" scoped>
.cumulative {
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  &-title {
    display: inline-block;
    color: #333;
    text-align: center;
    margin-right: 15px;
  }
  &-types-container {
    display: inline-block;
    .type {
      display: inline-block;
      &:not(:last-child) {
        &::after {
          content: '';
          display: inline-block;
          margin-left: 10px;
          margin-right: 10px;
          width: 1px;
          height: 10px;
          background: #ddd;
        }
      }
    }
  }

  &-label {
    text-align: center;
    font-size: 13px;
    color: #333;
    &.red, &.dragon, &.bigger, &.odd, &.odd_more, &.front_part_more {
      color: #eb2020;
    }
    &.blue, &.tiger, &.smaller, &.even, &.even_more, &.rear_part_more {
      color: #166fd8;
    }
    &.green, &.equal {
      color: #6bc23a;
    }
    &.gold, &.wood, &.water, &.fire, &.earth, &.text {
      color: #333;
    }
  }
}
</style>
