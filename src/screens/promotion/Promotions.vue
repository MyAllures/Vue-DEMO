<template>
  <el-row class="row-bg">
    <div class="container m-b-xlg block-center">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item> {{$t('navMenu.promotion')}} </el-breadcrumb-item>
      </el-breadcrumb>
      <promoBanner v-for="promo in promotions" :key="promo.id" :promo="promo" />
    </div>
  </el-row>
</template>
<script>
import PromoBanner from './PromoBanner.vue'
import { getPromotions } from '../../api'
import Vue from 'vue'
export default {
  name: 'Promotions',
  data () {
    return {
      activeIndex: '1',
      promo_labels: [this.$t('promotions.campaign'), this.$t('promotions.deposit_withdraw'), this.$t('promotions.lottery'), this.$t('promotions.others')],
      promotions: [],
      today: Vue.moment()
    }
  },
  components: {
    PromoBanner
  },
  created () {
    getPromotions().then(result => {
      this.promotions = result
    })
  },
  methods: {
    getdate (time) {
      if (time < 10) {
        return '0' + time
      }
    }
  }
}
</script>


