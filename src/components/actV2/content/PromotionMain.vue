<template>
  <div class="content">
    <div class="section">
      <div class="section-title">活动介绍</div>
      <div class="section-content">{{ act.description }}</div>
    </div>
    <div class="section">
      <div class="section-title">活动内容</div>
      <div class="section-content">
        <table v-if="type === 'boost'">
          <thead>
            <tr>
              <td>每日 金额</td>
              <td>每日有效投注金额</td>
              <td>当日可领红包个数</td>
              <td v-if="act.display_max_amount > 0">最高金额</td>
            </tr>
          </thead>
          <tbody>
            <tr :key="i" v-for="(level, i) in act.levels">
              <td v-if="i === 0" :rowspan="act.levels.length">{{ act.check_deposit.today_deposit || 0 }}+</td>
              <td>{{ level.bet_amount_min }}</td>
              <td>{{ level.count }}</td>
              <td v-if="i === 0 && act.display_max_amount > 0" :rowspan="act.levels.length">{{ act.display_max_amount }}</td>
            </tr>
          </tbody>
        </table>
        <table v-else-if="type === 'referral'">
          <thead>
            <tr>
              <td>推荐人数</td>
              <td>每成功推荐一人，可领红包数</td>
              <td v-if="act.display_max_amount > 0">最高金额</td>
            </tr>
          </thead>
          <tbody>
            <tr :key="i" v-for="(level, i) in act.levels">
              <td v-if="i < act.levels.length - 1">{{ level.referral_min }} ~ {{ act.levels[i + 1].referral_min - 1 }}</td>
              <td v-else>{{ level.referral_min }} 以上</td>
              <td>{{ level.count }}</td>
              <td v-if="i === 0 && act.display_max_amount > 0" :rowspan="act.levels.length">{{ act.display_max_amount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PromotionMain',
  props: {
    type: String,
    act: Object
  }
}
</script>

<style lang="scss" scoped>
</style>
