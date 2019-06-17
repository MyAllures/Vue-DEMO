<template>
  <div>
    <el-row class="m-b m-t">
      <el-form :inline="true" :model="conditions">
        <el-form-item :label="$t('user.betdate')" prop="startDate" :error="startDateValidate">
          <el-date-picker
            v-model="startDate"
            type="date"
            :id="'date1'"
            :name="'date1'"
            :placeholder="$t('user.choose_date')"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>~</el-form-item>
        <el-form-item prop="endDate" :error="endDateValidate">
          <el-date-picker
            v-model="endDate"
            :id="'date2'"
            :name="'date2'"
            type="date"
            :placeholder="$t('user.choose_date')"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <el-table v-loading="loading" :data="records" stripe>
        <el-table-column
          :label="$t('user.game_name')">
          <template slot-scope="scope">
            <router-link class="link" :to="`/account/bet_record/settled?startdate=${conditions.created_at_0}&enddate=${conditions.created_at_1}&game=${scope.row.game.id}`">{{scope.row.game.display_name}}</router-link>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('user.bet_count')"
          prop="bet_count">
        </el-table-column>
        <el-table-column
          :label="$t('user.bet_amount')">
          <template slot-scope="scope">
            <span>{{ scope.row.bet_amount | currency('￥')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('gameIntro.return_rate')">
          <template slot-scope="scope">
            <span>{{ scope.row.return_amount | currency('￥')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('user.profit')">
          <template slot-scope="scope">
            <span v-if="scope.row.profit === null">{{ statusFilter(scope.row.status) }}</span>
            <span v-else :class="profitColor(scope.row.profit)">{{ scope.row.profit | currency('￥')}}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-table v-if="recordTotal.length > 0 && records.length" :data="recordTotal" :show-header="false">
        <el-table-column prop="text">
        </el-table-column>
        <el-table-column prop="bet_count">
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <span>{{ scope.row.bet_amount | currency('￥')}}</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <span>{{ scope.row.return_amount | currency('￥')}}</span>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <span :class="profitColor(scope.row.profit)">{{ scope.row.profit | currency('￥')}}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="totalCount > pageSize"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="totalCount"
        @current-change="handlePageChange">
      </el-pagination>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { fetchPersonalReport } from '../../api'
import { msgFormatter } from '../../utils'
export default {
  name: 'PersonalReport',
  data () {
    const today = this.$moment()
    const todayFormat = today.format('YYYY-MM-DD')
    const weekPastFormat = today.add(-7, 'days').format('YYYY-MM-DD')
    return {
      currentPage: 1,
      pageSize: 20,
      totalCount: 0,
      offset: 0,
      loading: false,
      startDateValidate: '',
      endDateValidate: '',
      startDate: this.$route.query.startdate || weekPastFormat,
      endDate: this.$route.query.enddate || todayFormat,
      records: [],
      recordTotal: []
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    conditions () {
      return {
        created_at_0: this.startDate,
        created_at_1: this.endDate,
        limit: this.pageSize
      }
    }
  },
  watch: {
    'conditions': function (conditions) {
      let startDate = this.$moment(conditions.created_at_0)
      let endDate = this.$moment(conditions.created_at_1)
      if (startDate && endDate && startDate.diff(endDate) > 0) {
        this.startDateValidate = this.$t('validate.date_range_validate')
        this.endDateValidate = ''
      } else {
        this.startDateValidate = ''
        this.endDateValidate = ''
      }
      this.initFetchPersonalReport(conditions)
      const query = {
        startdate: this.startDate,
        enddate: this.endDate
      }
      this.$router.push({
        query
      })
    }
  },
  created () {
    this.initFetchPersonalReport({...this.conditions})
  },
  methods: {
    statusFilter (value) {
      if (value === 'no_draw') {
        return this.$t('user.no_draw')
      } else if (value === 'cancelled') {
        return this.$t('user.cancelled')
      } else {
        return this.$t('user.unsettled')
      }
    },
    profitColor (amount) {
      if (amount > 0) {
        return 'gain'
      } else if (amount < 0) {
        return 'loss'
      } else {
        return 'unsettle'
      }
    },
    initFetchPersonalReport (option) {
      this.loading = true
      fetchPersonalReport({...option})
        .then(data => {
          this.totalCount = data.count
          this.records = data.results

          this.currentPage = 1
          this.recordTotal = [{
            text: '总计',
            bet_count: data.total_bet_count,
            bet_amount: data.total_bet_amount,
            return_amount: data.total_return_amount,
            profit: data.total_profit
          }]
        }).catch(errorMsg => {
          this.$message({
            showClose: true,
            message: msgFormatter(errorMsg),
            type: 'error'
          })
        }).finally(() => {
          this.loading = false
        })
    },
    handlePageChange (currentPage) {
      this.loading = true
      fetchPersonalReport({ ...this.conditions, offset: (currentPage - 1) * this.pageSize }).then(data => {
        this.records = data.results
        this.recordTotal = [{
          text: '总计',
          bet_count: data.total_bet_count,
          bet_amount: data.total_bet_amount,
          return_amount: data.total_return_amount,
          profit: data.total_profit
        }]
      }).catch(errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../../style/vars.scss";
.gain {
  color: $red;
}
.loss {
  color: $green;
}
.unsettle {
  color: $primary;
}
.link {
  color: #1e66b9;
}
</style>


