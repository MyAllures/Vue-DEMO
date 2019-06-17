<template>
  <div class="logo p-l" v-if="$store.state.systemConfig.homePageLogo">
    <router-link to="/">
      <img :src="$store.state.systemConfig.homePageLogo" alt="logo" />
    </router-link>
  </div>
</template>

<script>
export default {
  data () {
    return {
      icon: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  float: left;
  height: 100%;
  min-width: 60px;
  vertical-align: middle;

  a {
    height: 100%;
    display: flex;
    align-items: center;
  }

  img {
    max-height: 90px;
    margin: 5px 0;
    display: block;
    margin: auto;
  }
}
</style>

