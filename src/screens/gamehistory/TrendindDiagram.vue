<template>
  <section class="trending-container skin__trending-diagram">
    <div class="chart-nav">
      <div class="date-pickers wrapper">
        <div>
          <span :class="['daterange-btn', {active: btn.key === conditions.daterange}]"
            @click="selectDateRange(btn)"
            v-for="(btn, index) in dateRangeBtns"
            :key="index">
            {{btn.label}}
          </span>
        </div>
        <el-button :loading="btnLoading.value"
          @click.native="fetchData(false)"
          :icon="btnLoading.checking ? 'el-icon-check':''"
          type="primary"
          class="refresh-btn">
          刷新数据
        </el-button>
      </div>
      <div class="wrapper">
        <div class="target-options">
          <template v-if="targetOptions.length">
            <span :class="['target-option', {active: option.key === conditions.target}]"
              @click="selectTarget(option)"
              v-for="(option, index) in targetOptions"
              :key="index">{{option.label}}</span>
          </template>
        </div>
        <div class="checkboxes">
          <el-checkbox-group v-model="checkList" @change="handleChartContentListChange">
            <el-checkbox label="chart">折线图</el-checkbox>
            <el-checkbox label="missing">遗漏</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <div class="table" v-loading="tableData.loading">
      <TrendingChart :tableLayout="tableLayout"
      :freqStats="tableData.freqStats"
      :results="tableData.results"
      :missingResultVisible="missingResultVisible"
      :chartVisible="chartVisible"
      :lineColor="themeColor"
      ></TrendingChart>
      <el-pagination
        v-if="$route.query.daterange !== '30' && tableData.totalCount > tableData.dataPerPage"
        @current-change="handlePageChange"
        :current-page.sync="currentPage"
        :page-size="tableData.dataPerPage"
        layout="total, prev, pager, next"
        :total="tableData.totalCount">
      </el-pagination>
    </div>
  </section>
</template>

<script>
import {GAMES_CHART_MAP} from '@/utils/trendingDiagram'
import TrendingChart from './TrendingChart'
import {fetchTrendChart} from '@/api'
import {mapState} from 'vuex'

export default {
  name: 'Trending',
  props: {
    gameCode: {
      type: String
    }
  },
  components: {
    TrendingChart
  },
  data () {
    const dataPerPage = 30
    const query = this.$route.query
    const now = this.$moment()
    const today = this.$moment().format('YYYY-MM-DD')

    let checkList = ['chart', 'missing']
    let dateRangeBtns = [
      {
        label: '近 30 期',
        key: '30',
        params: {
          offset: 0,
          limit: dataPerPage
        }
      },
      {
        label: '今日数据',
        key: 'today',
        params: {
          start_date: today,
          end_date: today,
          offset: 0,
          limit: dataPerPage
        }
      },
      {
        label: '近 2 天',
        key: 'two_ago',
        params: {
          start_date: now.clone().subtract(1, 'days').format('YYYY-MM-DD'),
          end_date: today,
          offset: 0,
          limit: dataPerPage
        }
      },
      {
        label: '近 5 天',
        key: 'five_ago',
        params: {
          start_date: now.clone().subtract(4, 'days').format('YYYY-MM-DD'),
          end_date: today,
          offset: 0,
          limit: dataPerPage
        }
      }
    ]
    return {
      checkList,
      dateRangeBtns,
      conditions: {
        target: query.target,
        start_date: query.start_date,
        end_date: query.end_date,
        limit: query.limit,
        offset: query.offset,
        daterange: query.daterange
      },
      tableData: {
        freqStats: null,
        results: [],
        loading: false,
        totalCount: 0,
        dataPerPage,
        currentPage: 1
      },
      targetOptions: [],
      currentTargetLabel: '',
      interval: null,
      btnLoading: {
        value: false,
        checking: false
      }
    }
  },
  methods: {
    fetchData (tableLoading) {
      if (this.tableData.loading || this.btnLoading.value) { return }

      if (tableLoading === true) {
        this.tableData.loading = true
      } else {
        this.btnLoading.value = true
      }

      let conditions = Object.assign({}, this.conditions)
      conditions.game_code = this.$route.params.gameCode
      conditions.type = this.$route.params.type
      delete conditions.daterange

      fetchTrendChart({...conditions}).then((res) => {
        if (res.frequency_stats.numbers) {
          this.tableData.freqStats = res.frequency_stats
        }
        this.tableData.results = res.results
        this.tableData.totalCount = res.count
      }).finally(() => {
        this.tableData.loading = false
        this.btnLoading.value = false
        this.btnLoading.checking = true
        setTimeout(() => {
          this.btnLoading.checking = false
        }, 1000)
      })
    },
    handlePageChange (page) {
      this.conditions = {
        ...this.conditions,
        offset: this.tableData.dataPerPage * (page - 1),
        limit: this.tableData.dataPerPage
      }
    },
    selectTarget (target) {
      if (this.tableData.loading) { return }
      if (!this.targetOptions.length) {
        delete this.conditions.target
        return
      }
      this.tableData.currentPage = 1
      this.currentTargetLabel = target.label
      this.conditions.target = target.key
    },
    selectDateRange (btn) {
      if (this.tableData.loading) { return }
      this.tableData.currentPage = 1
      this.conditions = {daterange: btn.key, type: this.conditions.type, target: this.conditions.target, ...btn.params}
    }
  },
  computed: {
    ...mapState({
      themeColor: state => state.systemConfig.themeColor || '#ddd'
    }),
    missingResultVisible () {
      return this.checkList.includes('missing')
    },
    chartVisible () {
      return this.checkList.includes('chart')
    },
    tableLayout () {
      return GAMES_CHART_MAP[this.$route.params.gameCode].table[this.$route.params.type](this.currentTargetLabel)
    }
  },
  created () {
    this.targetOptions = GAMES_CHART_MAP[this.$route.params.gameCode].options[this.$route.params.type]
    if (!this.$route.query.target) {
      this.selectTarget(this.targetOptions[0])
    }
    if (!this.$route.query.daterange) {
      this.selectDateRange(this.dateRangeBtns[0])
    }
    this.interval = setInterval(() => {
      this.fetchData(true)
    }, (1 * 60 * 1000))
    this.fetchData(true)
  },
  watch: {
    'conditions': {
      handler (conditions) {
        this.$router.push({ query: conditions })
      },
      immediate: true,
      deep: true
    },
    '$route': {
      handler () {
        this.fetchData(true)
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>
<style lang="scss" scoped>
.chart-nav {
  margin-bottom: 10px;
  .wrapper {
    display: flex;
    justify-content: space-between;
  }
  .refresh-btn {
    font-size: 14px;
  }
}

.table {
  text-align: center;
}
.date-pickers {
  margin-bottom: 20px;
}

.date-picker {
  display: inline-block;
  vertical-align: middle;
}

.daterange-btn {
  display: inline-block;
  box-sizing: border-box;
  font-size: 13px;
  width: auto;
  height: 24px;
  margin-right: 10px;
  text-align: center;
  color: #333;
  line-height: 20px;
  padding: 3px 10px;
  cursor: pointer;
  &:hover {
    &:not(.active) {
      opacity: .8;
    }
  }
  &.active {
    // background-color: #1e66b9;
    color: #fff;
    border-radius: 12px;
    cursor: default;
  }
}

.target-option {
  display: inline-block;
  box-sizing: border-box;
  padding-right: 10px;
  padding-left: 10px;
  font-size: 12px;
  color: #333;
  cursor: pointer;

  &:not(:last-child) {
    border-right: 1px solid #ddd;
  }
  &:hover {
    &:not(.active) {
      opacity: .8;
    }
  }

  &.active {
    font-weight: 500;
    // color: #1e66b9;
    cursor: default;
  }
}
</style>
