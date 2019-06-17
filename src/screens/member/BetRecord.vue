<template>
  <div>
    <el-row class="m-b">
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
        <el-form-item :label="$t('user.game_name')">
          <el-select v-model="selectedGame">
            <el-option
              key="all"
              :label="$t('common.all')"
              value="">
            </el-option>
            <el-option
              v-for="game in allGames"
              :key="game.id+''"
              :label="game.display_name"
              :value="game.id+''">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" v-if="isModal">
          <el-checkbox v-model="isUnsettled">{{$t('user.unsettled_period')}}</el-checkbox>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <BetRecordTable :records="betRecords"
        :loading="loading"
        :total="betRecordTotal">
      </BetRecordTable>
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
import { fetchBetHistory, fetchBetTotal } from '../../api'
import { msgFormatter } from '../../utils'
import { mapGetters } from 'vuex'
import BetRecordTable from '@/components/BetRecordTable'

export default {
  name: 'BetRecord',
  props: {
    lazyFetch: {
      type: Boolean
    },
    isModal: Boolean
  },
  components: {
    BetRecordTable
  },
  data () {
    const today = this.$moment().format('YYYY-MM-DD')
    let selectedGame = ''
    let routeGame = this.$store.getters.allGames.find(g => ((this.$route.query.game === g.id + '') || this.$route.query.game === g.code + ''))
    if (this.$route.query.game) {
      if (routeGame) {
        selectedGame = routeGame.id + ''
      }
    }
    return {
      betRecords: [],
      betRecordTotal: [],
      selectedGame,
      currentPage: 1,
      pageSize: 20,
      loading: false,
      isUnsettled: this.isModal ? false : this.$route.name !== 'SettledBetRecord',
      totalCount: 0,
      offset: 0,
      startDateValidate: '',
      endDateValidate: '',
      startDate: this.$route.query.startdate || today,
      endDate: this.$route.query.enddate || today
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    conditions () {
      let status
      if (this.isUnsettled) {
        status = 'ongoing,cancelled,no_draw'
      } else if (!this.isModal) {
        status = 'win,lose,tie,cancelled,no_draw'
      } else { // 彈窗模式下非未結則顯示全部
        status = 'ongoing,win,lose,tie,cancelled,no_draw'
      }

      return {
        game: this.selectedGame || '',
        status,
        created_at_0: this.startDate,
        created_at_1: this.endDate
      }
    }
  },
  watch: {
    'lazyFetch': {
      immediate: true,
      handler: function (lazyFetch) {
        if (!lazyFetch) {
          this.initFetchBetHistory({...this.conditions})
        }
      }
    },
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
      this.initFetchBetHistory(conditions)
      const query = {
        startdate: this.startDate,
        enddate: this.endDate
      }
      if (conditions.game) {
        query.game = conditions.game
      }
      if (!this.isModal) {
        this.$router.push({
          query
        })
      }
    }
  },
  methods: {
    initFetchBetHistory (option) {
      this.loading = true
      this.getSummary()
      fetchBetHistory({ ...option, offset: 0 })
        .then(data => {
          if (data.results) {
            this.totalCount = data.count
            this.betRecords = data.results
          } else {
            this.totalCount = data.length
            this.betRecords = data
          }

          this.currentPage = 1
          this.loading = false
        }, errorMsg => {
          this.$message({
            showClose: true,
            message: msgFormatter(errorMsg),
            type: 'error'
          })
          this.loading = false
        })
    },
    handlePageChange (currentPage) {
      this.loading = true
      this.getSummary()
      fetchBetHistory({ ...this.conditions, offset: (currentPage - 1) * this.pageSize }).then(data => {
        this.betRecords = data.results || data

        this.loading = false
      }, () => {
        this.loading = false
      })
    },
    getSummary () {
      fetchBetTotal({startdate: this.startDate || '', enddate: this.endDate || '', game: this.conditions.game, status: this.conditions.status}).then(res => {
        const total = res.results[0]
        if (total) {
          this.betRecordTotal = [{
            text: '总计',
            amount: total.amount,
            profit: total.profit
          }]
        } else {
          this.betRecordTotal = []
        }
      }).catch(errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>


</style>

