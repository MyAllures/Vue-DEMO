<template>
  <div>
    <el-table class="table" v-loading="loading" :data="records" stripe>
      <el-table-column
        :width="100"
        :label="$t('user.game_name')"
        prop="game.display_name">
      </el-table-column>
      <el-table-column
        :width="190"
        :label="$t('user.issue_number')"
        prop="issue_number">
        <template slot-scope="scope">
          <span>{{ scope.row.match || scope.row.issue_number }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :width="145"
        :label="$t('user.betdate')"
        prop="created_at">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at | moment("YYYY-MM-DD")}}</span>
          <span class="tip" v-if="scope.row.bet_type === 'is_bettrackrecorde' || scope.row.bet_type === 'is_bettrackrecord'">(追号)</span>
          <span class="tip" v-if="scope.row.bet_type === 'is_expert_plan'">(专家计划)</span>
        </template>
      </el-table-column>
      <el-table-column
        :min-width="150"
        :label="$t('user.play')">
        <template slot-scope="scope">
          <div>{{ `${scope.row.play.playgroup} @ ${scope.row.play.display_name}`}}</div>
          <div v-if="scope.row.bet_options&&scope.row.bet_options.options">{{`共${scope.row.bet_options.opts_combos_count}组 # ${scope.row.bet_options.options.join(',')}`}}</div>
        </template>
      </el-table-column>
      <el-table-column
        :width="135"
        :label="$t('user.bet_amount')">
        <template slot-scope="scope">
          <span>{{ scope.row.bet_amount | currency('￥')}}</span>
          <span v-if="scope.row.prepaid_amount">(+{{scope.row.prepaid_amount}})</span>
        </template>
      </el-table-column>
      <el-table-column
        :width="105"
        :label="$t('gameIntro.return_rate')">
        <template slot-scope="scope">
          <span>{{ scope.row.play.return_rate && scope.row.return_amount ? `${scope.row.return_amount}(${Math.floor(scope.row.play.return_rate*10000)/100}%)`: '0' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :width="125"
        :label="$t('user.profit')">
        <template slot-scope="scope">
          <span v-if="scope.row.profit === null">{{ statusFilter(scope.row.status) }}</span>
          <span v-else :class="profitColor(scope.row.profit)">{{ scope.row.profit | currency('￥')}}</span>
        </template>
      </el-table-column>
      <el-table-column
        :width="85"
        :label="$t('user.odd')"
        prop="odds">
      </el-table-column>
    </el-table>

    <el-table v-if="total && total.length > 0" :data="total" :show-header="false">
      <el-table-column
        :width="100">
      </el-table-column>
      <el-table-column
        :width="190">
      </el-table-column>
      <el-table-column
        :width="125">
      </el-table-column>
      <el-table-column
        :min-width="150"
        prop="text">
      </el-table-column>
      <el-table-column
        :width="135">
        <template slot-scope="scope">
          <span>{{ scope.row.amount | currency('￥')}}</span>
        </template>
      </el-table-column>
      <el-table-column
        :width="90">
      </el-table-column>
      <el-table-column
        :width="125">
        <template slot-scope="scope">
          <span :class="profitColor(scope.row.profit)">{{ scope.row.profit | currency('￥')}}</span>
        </template>
      </el-table-column>
      <el-table-column
        :width="65">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: ['records', 'total', 'loading'],
  methods: {
    profitColor (amount) {
      if (amount > 0) {
        return 'gain'
      } else if (amount < 0) {
        return 'loss'
      } else {
        return 'unsettle'
      }
    },
    statusFilter (value) {
      if (value === 'no_draw') {
        return this.$t('user.no_draw')
      } else if (value === 'cancelled') {
        return this.$t('user.cancelled')
      } else {
        return this.$t('user.unsettled')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/vars.scss";
.gain {
  color: $red;
}

.loss {
  color: $green;
}

.unsettle {
  color: $primary;
}

.tip {
  color: #999;
}
</style>
