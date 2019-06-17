<template>
  <div class="wrapper skin__plansite-button clickable" v-if="planSiteUrl" @click="handlePlanSiteBtnClick">
    <i class="icon"></i><span class="text">热门专家计划</span>
  </div>
</template>

<script>
export default {
  props: {
    gameCode: {
      type: String,
      required: true
    }
  },
  computed: {
    planSiteUrl () {
      const planSiteSetting = this.$store.state.systemConfig.planSiteSetting
      const siteHost = window.location.host

      if (planSiteSetting.host && planSiteSetting.games.includes(this.gameCode)) {
        return `${planSiteSetting.host}/game/${this.gameCode}?utm_source=pc_gamehall&utm_campaign=${siteHost}`
      }
    }
  },
  methods: {
    handlePlanSiteBtnClick () {
      const width = 600
      const height = 800
      const top = window.innerHeight - height
      const left = window.innerHeight
      const config = `height=${height},width=${width},top=${top}, left=${left},toolbar=no,menubar=no,scrollbars=no,resizable=no,location=yes,status=no`
      window.open(this.planSiteUrl, '', config)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  &:hover {
    opacity: .8;
  }
}

.icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background-image: url('../assets/icon_fire.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  vertical-align: middle;
}

.text {
  vertical-align: middle;
  color: #333;
}
</style>
