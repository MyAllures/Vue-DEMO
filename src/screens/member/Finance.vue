<template>
<el-row class="m-t">
  <el-tabs v-model="activeName" class="indented-tab" type="card" @tab-click="handleClick">
    <el-tab-pane :label="$t('user.payment_record')" name="PaymentRecord"></el-tab-pane>
    <el-tab-pane :label="$t('user.discount_record')" name="DiscountRecord"></el-tab-pane>
    <el-tab-pane :label="$t('user.withdraw_record')" name="WithdrawRecord"></el-tab-pane>
    <el-tab-pane :label="$t('user.return_record')" name="ReturnRecord"></el-tab-pane>
    <el-tab-pane label="追号纪录" name="TrackRecord"></el-tab-pane>
  </el-tabs>
  <router-view class="m-t"/>
</el-row>
</template>
<script>
export default {
  name: 'Finance',
  data () {
    return {
      activeName: this.$route.name
    }
  },
  beforeRouteEnter (to, from, next) {
    if (to.name === 'Finance') {
      next({ name: 'PaymentRecord' })
    } else {
      next()
    }
  },
  watch: {
    '$route': function (to, from) {
      if (to.name === 'Finance') {
        this.$router.push({ name: 'PaymentRecord' })
      }
    },
    '$route.name': function () {
      this.activeName = this.$route.name
    }
  },
  methods: {
    handleClick (tab, event) {
      this.$router.push({ name: tab.name })
    }
  }
}
</script>
