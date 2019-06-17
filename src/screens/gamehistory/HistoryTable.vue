<template>
  <div class="schedule-container" v-loading="loading">
    <div class="user-actions">
      <div class="filters">
        <div class="input">
          <el-date-picker
            v-if="currentGame === 'hkl' || currentGame === 'fc3d'"
            id="date"
            type="daterange"
            v-model="selectedDate"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            range-separator="~"
            unlink-panels
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-date-picker
            v-else
            id="date"
            type="date"
            v-model="selectedDate"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd">
          </el-date-picker>
        </div>
        <div class="input">
          <el-input type="number"
            :value="inputPeriod"
            @input="changeIssueNumber"
            placeholder="输入期数">
          </el-input>
        </div>
      </div>
      <div class="refresh">
        <el-button type="primary" @click="getLatest()">刷新数据</el-button>
      </div>
    </div>
    <div class="historydata m-b-xlg">
      <div v-if="!schedules.length">暂无资料</div>
      <table v-else class="history-table">
        <tr>
          <th v-for="(fieldsObject, fieldsIndex) in nowGameTable.table"
            :key="'fields-' + nowGameTable.code + fieldsIndex">
            {{fieldsObject.displayName}}
            <el-button v-if="fieldsObject.buttons"
              type="info"
              size="mini"
              v-for="(button, index) in fieldsObject.buttons"
              :key="fieldsIndex + nowGameTable.code + index"
              @click="nowDisplay = button.show">
              {{button.displayName}}
            </el-button>
            <div>
              <div v-if="fieldsObject.subHeads && subHead.displayName"
                v-for="subHead in fieldsObject.subHeads"
                :key="'field-' + currentGame + '-subHead-' + subHead.key"
                :style="{'display': 'inline-block',
                        'width': 1/fieldsObject.subHeads.length * 100 + '%'}">
                <span>{{subHead.displayName}}</span>
              </div>
            </div>
          </th>
        </tr>
        <tr v-for="(schedule, scheduleIndex) in schedules"
          :key="scheduleIndex + 'issue-' + schedule.issue_number">
          <td v-for="(fieldsObject, fieldsIndex) in nowGameTable.table"
            :key="nowGameTable.code + 'field-content-'+ fieldsIndex"
            v-if="!fieldsObject.buttons && fieldsObject.key !== 'result_str'">
            <span v-if="schedule[fieldsObject.key]">
              {{schedule[fieldsObject.key]}}
            </span>
            <span v-else-if="schedule.result_category"
              :class="schedule.result_category[fieldsObject.key]">
                {{schedule.result_category[fieldsObject.key] |resultFilter}}
            </span>
            <div v-if="fieldsObject.subHeads && !schedule.result_category">暂无统计资料</div>
            <div v-else>
              <span v-if="fieldsObject.subHeads"
                :class="{
                  win : schedule.result_category[subHead.key + '_result'] === 'win',
                  seperate: currentGame === 'msnn' || currentGame === 'pk10nn'
                }"
                v-for="subHead in fieldsObject.subHeads"
                :key="'centent-'+currentGame+'-subHead-'+subHead.key"
                :style="{'display': 'inline-block',
                        'width': 1/fieldsObject.subHeads.length * 100 + '%'}">
                <b v-if="currentGame === 'msnn'|| currentGame === 'pk10nn'">
                  <p>{{schedule.result_category[subHead.key].slice(0, 2)}}</p>
                  <p>{{schedule.result_category[subHead.key].slice(3)}}</p>
                </b>
                <b v-else :class="schedule.result_category[subHead.key]">
                  {{schedule.result_category[subHead.key] |resultFilter}}
                </b>

              </span>
              <span v-else>-</span>
            </div>
          </td>
          <td v-else>
            <ResultNums
              v-if="schedule.result_status === 'valid'"
              :schedule="schedule"
              :displayType="nowDisplay"
              :gameCode="currentGame">
            </ResultNums>
            <div v-else>官方开奖无效</div>
          </td>
        </tr>
      </table>
      <el-pagination v-if="totalCount > pageSize"
        :current-page.sync="currentPage"
        @current-change="handlePageChange"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="totalCount">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { fetchHistory } from '../../api'
import ResultNums from './ResultNums'
import { msgFormatter } from '../../utils'
import historySetting from '../../utils/historySetting.js'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  data () {
    const today = this.$moment().format('YYYY-MM-DD')
    let selectedDate
    let gameCode = this.$route.params.gameCode
    if (gameCode === 'hkl' || gameCode === 'fc3d') {
      selectedDate = [this.$moment().startOf('month').format('YYYY-MM-DD'), today]
    } else {
      selectedDate = today
    }
    return {
      schedules: '',
      nowDate: this.$moment().format('YYYY-MM-DD'),
      loading: false,
      nowDisplay: 'number',
      gameTable: historySetting.gameTable,
      nowGameTable: '',
      inputPeriod: '',
      selectedDate: selectedDate,
      currentPage: 1,
      pageSize: 30,
      totalCount: 0
    }
  },
  filters: {
    resultFilter: function (val) {
      return historySetting.resultFilter(val)
    }
  },
  methods: {
    initFetchHistory () {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
        this.fetchData((this.currentPage - 1) * this.pageSize)
      }, (1 * 60 * 1000))
      this.schedules = ''
      this.fetchData(0)
      this.nowDisplay = 'number'
      this.currentPage = 1
    },
    handlePageChange (currentPage) {
      clearInterval(this.interval)
      this.interval = setInterval(() => {
        this.fetchData((this.currentPage - 1) * this.pageSize)
      }, (1 * 60 * 1000))
      this.fetchData((currentPage - 1) * this.pageSize)
    },
    fetchData (offset) {
      this.loading = true
      this.$emit('load', this.loading)
      fetchHistory({ ...this.conditions, game_code: this.currentGame ? this.currentGame : this.$route.params.gameCode, offset: offset }).then((result) => {
        if (result.results) {
          if (this.currentGame === 'bjkl8') {
            _.each(result.results, (schedule) => {
              let resultArr = schedule.result_str.split(',')
              resultArr.pop() // for bjkl8 useless 21th num
              schedule.result_str = resultArr.join()
            })
          }
          _.each(result.results, (schedule) => {
            schedule.schedule_result = this.$moment(schedule.schedule_result).format('YYYY-MM-DD HH:mm:ss')
          })
          this.totalCount = result.count
          this.schedules = result.results
        }
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      }).catch(() => {}).finally(() => {
        this.loading = false
        this.$emit('load', this.loading)
      })
    },
    getLatest () {
      let currentDate = this.$moment().format('YYYY-MM-DD')
      if (!Array.isArray(this.selectedDate)) {
        if (this.selectedDate === currentDate) {
          this.initFetchHistory()
        } else {
          this.selectedDate = this.$moment().format('YYYY-MM-DD')
        }
      } else {
        const startOfMonth = this.$moment().startOf('month').format('YYYY-MM-DD')
        if (this.selectedDate[0] === startOfMonth && this.selectedDate[1] === currentDate) {
          this.initFetchHistory()
        } else {
          this.$set(this.selectedDate, 0, startOfMonth)
          this.$set(this.selectedDate, 1, currentDate)
        }
      }
    },
    changeIssueNumber: _.debounce(function (value) {
      this.inputPeriod = value
    }, 1000),
    sendGaConfig () {
      const gaTrackingId = this.$store.state.systemConfig.gaTrackingId
      const currentGame = this.allGames.find(game => game.code === this.currentGame)
      if (gaTrackingId) {
        window.gtag('config', gaTrackingId, {page_path: this.$route.path, page_title: `历史开奖 - ${currentGame.display_name}`})
      }
    }
  },
  computed: {
    conditions () {
      if (!Array.isArray(this.selectedDate)) {
        return {
          schedule_result_0: this.selectedDate,
          schedule_result_1: this.selectedDate,
          issue_number_q: this.inputPeriod
        }
      }
      return {
        schedule_result_0: this.selectedDate[0],
        schedule_result_1: this.selectedDate[1],
        issue_number_q: this.inputPeriod
      }
    },
    currentGame () {
      return this.$route.params.gameCode
    },
    ...mapGetters([
      'allGames'
    ])
  },
  components: {
    ResultNums
  },
  created () {
    this.nowGameTable = _.find(this.gameTable, item => {
      return item.code === this.$route.params.gameCode
    })
    this.initFetchHistory()
    if (this.allGames.length > 0) {
      this.sendGaConfig()
    } else {
      const unwatch = this.$watch('allGames', function (allGames) {
        this.sendGaConfig()
        unwatch()
      })
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  watch: {
    'conditions': function () {
      this.initFetchHistory()
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../style/vars.scss";

.bigger,
.even,
.dragon,
.composite {
  color: $red;
}

.schedule-container {
  text-align: center;
}
.historydata {
  padding: 10px;
  background: #fff;
}
.history-table {
  width: 100%;
  background: white;
  margin-bottom: 10px;
  th {
    font-weight: bold;
  }
  td,
  th {
    border: $cell-border;
    height: $cell-height;
    line-height: $cell-height;
    vertical-align: middle;
  }
  .group-name {
    line-height: $cell-height;
    text-align: center;
    font-weight: bold;
  }
}

.user-actions {
  height: 70px;
  background-color: #fff;
  text-align: justify;
  margin-bottom: 10px;
  .filters,
  .refresh {
    margin-left: 10px;
    padding-top: 20px;
    display: inline-block;
    .input {
      display: inline-block;
    }
  }
  .refresh {
    margin-right: 28px;
  }
  &:after {
    content: "";
    display: inline-block;
    width: 100%;
  }
}

.win {
  box-sizing: border-box;
  background-color: lighten(#409EFF, 30%);
}

.seperate {
  border-right: 1px solid #ddd;
  box-sizing: border-box;
  &:last-child {
    border: none;
  }
}
</style>

