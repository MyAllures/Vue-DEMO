<template>
  <div class="header">
    <div>
      <span class="name">联系客服</span>
    </div>
    <div>
      <i class="close-icon" @click="leaveService">
        <img :src="icon.close" alt="close">
      </i>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      icon: {
        close: require('@/assets/icon_close.svg')
      },
      folded: true
    }
  },
  methods: {
    leaveService () {
      this.$router.replace({query: {service: 'off'}})
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  height: 45px;
  line-height: 45px;
  box-sizing: border-box;
  border: solid 1px #166fd8;
  background-color: #166fd8;
  padding: 0 5px 0 10px;
}

.name {
  font-size: 16px;
  color: #fff;
}

.close-icon {
  padding: 10px;
  cursor: pointer;
}
</style>
