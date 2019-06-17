<template>
  <el-row class="m-t">
    <el-tabs v-model="activeName" class="indented-tab" type="card" @tab-click="handleClick">
      <el-tab-pane label="已结注单" name="SettledBetRecord"></el-tab-pane>
      <el-tab-pane label="未结注单" name="UnsettledBetRecord"></el-tab-pane>
    </el-tabs>
    <router-view :key="this.$route.name" class="m-t"/>
  </el-row>
</template>
<script>
export default {
  name: 'BetRecordTab',
  data () {
    return {
      activeName: this.$route.name
    }
  },
  beforeRouteEnter (to, from, next) {
    if (to.name === 'BetRecordTab') {
      next({ name: 'SettledBetRecord' })
    } else {
      next()
    }
  },
  watch: {
    '$route': function (to, from) {
      if (to.name === 'BetRecordTab') {
        this.$router.push({ name: 'SettledBetRecord' })
      }
    },
    '$route.name': function () {
      this.activeName = this.$route.name
    }
  },
  methods: {
    handleClick (tab, event) {
      this.$router.push({ name: tab.name, query: this.$route.query })
    }
  }
}
</script>
