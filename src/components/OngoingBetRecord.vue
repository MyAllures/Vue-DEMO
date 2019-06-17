<template>
  <div>
    <el-row>
      <el-tabs v-model="activeTab" class="indented-tab" type="card">
      <el-tab-pane label="未结注单" name="UnsettledBetRecord"></el-tab-pane>
        <el-tab-pane label="进行中追号" name="BettrackRecord"></el-tab-pane>
      </el-tabs>
    </el-row>
    <template>
      <el-table v-if="activeTab === 'BettrackRecord'" class="table" v-loading="loading" :data="records" stripe>
        <el-table-column
          label="玩法">
          <template slot-scope="scope">
            <template v-if="scope.row.play">
              {{scope.row.play.playgroup}} @ {{scope.row.play.display_name}}
              <p v-if="scope.row.bet_options && scope.row.bet_options.options">共{{scope.row.bet_options.opts_combos_count}}组{{scope.row.bet_options.options.join(',')}}</p>
            </template>
            <template v-else>
              <span> {{scope.row.play_position}} </span>
              <span :class="{red: number === scope.row.winning_number}" v-for="(number, index) in scope.row.track_numbers" :key="index">
              {{number}}
              </span>
            </template>
          </template>
        </el-table-column>
        <el-table-column
          :width="150"
          label="追号期数">
          <template slot-scope="scope">
            <span>
              {{ scope.row.type }}期
                (<template>
                  <span v-if="scope.row.issue_numbers.length > 1">{{scope.row.issue_numbers[0].slice(-3)}}-{{scope.row.issue_numbers[scope.row.issue_numbers.length - 1].slice(-3)}}期
                  </span>
                  <span v-else> {{scope.row.issue_numbers[0].slice(-3)}} 期</span>
                </template>)
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :width="135"
          :label="$t('user.bet_amount')">
          <template slot-scope="scope">
            <span>{{ scope.row.bet_amount | currency('￥')}}</span>
          </template>
        </el-table-column>
        <el-table-column
          :width="135"
          :label="'翻倍'">
          <template slot-scope="scope">
            <span>{{ scope.row.multiple}}倍</span>
          </template>
        </el-table-column>
        <el-table-column
          :width="135"
          :label="'结果'">
          <template slot-scope="scope">
            <span class="ongoing">进行中</span>
          </template>
        </el-table-column>
        <el-table-column
          :width="100"
          :label="'盈亏'">
          <template slot-scope="scope">
            <span>-</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="'成单时间'">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | moment("MM-DD HH:mm:ss")}}</span>
            <span class="tip" v-if="scope.row.bet_type === 'is_expert_plan'">(专家计划)</span>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-if="activeTab === 'UnsettledBetRecord'" class="table" v-loading="loading" :data="records" stripe>
        <el-table-column
          :width="150"
          :label="$t('user.issue_number')"
          prop="issue_number">
          <template slot-scope="scope">
            <span>{{ scope.row.issue_number }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :width="175"
          :label="$t('user.betdate')"
          prop="created_at">
          <template slot-scope="scope">
            <span>{{ scope.row.created_at | moment("YYYY-MM-DD")}}</span>
            <span class="track" v-if="scope.row.bet_type === 'is_bettrackrecorde' || scope.row.bet_type === 'is_bettrackrecord'">(追号)</span>
            <span class="tip" v-if="scope.row.bet_type === 'is_expert_plan'">(专家计划)</span>
          </template>
        </el-table-column>
        <el-table-column
          :min-width="150"
          :label="$t('user.play')">
          <template slot-scope="scope">
            <div>{{ `${scope.row.play.playgroup} @ ${scope.row.play.display_name}`}}</div>
            <div v-if="scope.row.bet_options && scope.row.bet_options.options">{{`共${scope.row.bet_options.opts_combos_count}组 # ${scope.row.bet_options.options.join(',')}`}}</div>
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
          :width="130"
          :label="$t('gameIntro.return_rate')">
          <template slot-scope="scope">
            <span>{{ scope.row.play.return_rate && scope.row.return_amount ? `${scope.row.return_amount}(${Math.floor(scope.row.play.return_rate*10000)/100}%)`: '0' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :width="85"
          :label="$t('user.odd')"
          prop="odds">
          <template slot-scope="scope">{{scope.row.odds}}</template>
        </el-table-column>
    </el-table>
    </template>
  </div>
</template>

<script>
import {fetchGeneralBettrackRecord, fetchBet} from '@/api'
import {msgFormatter} from '@/utils'
import {mapGetters, mapState} from 'vuex'

export default {
  data () {
    return {
      activeTab: 'UnsettledBetRecord',
      records: [],
      loading: false
    }
  },
  computed: {
    ...mapGetters(['gameById']),
    ...mapState(['betRecordDialog']),
    condition () {
      const today = this.$moment().format('YYYY-MM-DD')
      let game = this.gameById(this.$route.params.gameId)
      if (this.activeTab === 'UnsettledBetRecord') {
        game = game.id
        return {
          gameId: game,
          scheduleId: this.betRecordDialog.schedule
        }
      }
      if (this.activeTab === 'BettrackRecord') {
        game = game.code
        return {
          game,
          start_date: today,
          end_date: today,
          status: 'ongoing'
        }
      }
    }
  },
  watch: {
    activeTab: {
      handler (activeTab) {
        this.records = []
        this.loading = false
        if (activeTab === 'BettrackRecord') {
          this.initFetchBetTrackHistory(this.condition)
        }
        if (activeTab === 'UnsettledBetRecord') {
          this.fetchOngoingBet(this.condition)
        }
      },
      immediate: true
    }
  },
  methods: {
    initFetchBetTrackHistory (option) {
      this.loading = true
      fetchGeneralBettrackRecord({ ...option, offset: 0 }).then((data) => {
        if (data.results) {
          this.totalCount = data.count
          this.records = data.results
        } else {
          this.totalCount = data.length
          this.records = data
        }
        this.currentPage = 1
      },
      errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      }).finally(() => {
        this.loading = false
      })
    },
    fetchOngoingBet (option) {
      fetchBet(option).then(data => {
        this.records = data
      })
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

.track {
  color: #999;
}
.ongoing {
  color: #409eff;
}
.tip {
  color: #999;
}
</style>
