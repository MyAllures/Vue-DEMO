<template>
  <el-table v-loading="recordLoading" :data="trackRecords" stripe>
    <el-table-column label="游戏" prop="game.display_name">
    </el-table-column>
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
      :width="80"
      :label="'翻倍'">
      <template slot-scope="scope">
        <span>{{ scope.row.multiple}}倍</span>
      </template>
    </el-table-column>
    <el-table-column label="结果" :width="80">
      <template slot-scope="scope">
        <span :class="['status-text', scope.row.status]">{{ scope.row.status | statusFilter}}</span>
        <el-popover
          popper-class="bettrack-tip-popover"
          v-if="scope.row.status==='cancelled'&&scope.row.message"
          placement="bottom-end"
          width="auto"
          trigger="hover"
          :offset="30"
          :popperOptions="{
            modifiersIgnored: ['preventOverflow', 'flip']
          }"
          :content="scope.row.message">
          <icon slot="reference" class="tip-icon" name="exclamation"></icon>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="盈亏">
      <template slot-scope="scope">
        <span v-if="scope.row.status!=='win'&&scope.row.status!=='death'">-</span>
        <span class="green" v-else-if="scope.row.profit<0">{{ scope.row.profit | currency('￥')}}</span>
        <span class="red" v-else>{{ scope.row.profit | currency('￥')}}</span>
      </template>
    </el-table-column>
    <el-table-column label="成单时间">
      <template slot-scope="scope">
        <span>{{ scope.row.created_at | moment("YYYY-MM-DD HH:mm:ss")}}</span>
        <span class="tip" v-if="scope.row.bet_type === 'is_expert_plan'">(专家计划)</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import 'vue-awesome/icons/exclamation'
import { msgFormatter } from '../utils'
import { fetchGeneralBettrackRecord } from '../api'
export default {
  name: 'TrackTable',
  filters: {
    statusFilter (value) {
      switch (value) {
        case 'cancelled':
          return '取消'
        case 'win':
          return '中'
        case 'death':
        case 'lose':
          return '挂'
        default:
          return '进行中'
      }
    }
  },
  props: {
    game: String,
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    page: [String, Number],
    pageSize: Number,
    totalCount: Number
  },
  data () {
    return {
      recordLoading: false,
      trackRecords: []
    }
  },
  computed: {
    conditions () {
      return {
        game: this.game,
        offset: (this.page - 1) * this.pageSize,
        limit: this.pageSize,
        start_date: this.startDate,
        end_date: this.endDate
      }
    }
  },
  watch: {
    'conditions': function () {
      this.fetchBetTrack()
    }
  },
  created () {
    this.fetchBetTrack(this.conditions)
  },
  methods: {
    fetchBetTrack () {
      this.recordLoading = true

      fetchGeneralBettrackRecord(this.conditions).then(data => {
        this.$emit('update:totalCount', data.count)
        this.trackRecords = data.results
        this.loading = false
      }).catch(errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      }).finally(() => {
        this.recordLoading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../style/vars.scss';
.ongoing {
  color: #409eff;
}
.win {
  color: $red;
}
.death,.lose {
  color: #999;
}
.status-text {
  margin-right: 5px;
}
.tip-icon {
  position: relative;
  top: -1px;
  box-sizing: border-box;
  width: 15px;
  height: 15px;
  color: $red;
  font-size: 12px;
  padding: 2px;
  border: 1px solid $red;
  border-radius: 50%;
  vertical-align: middle;
  cursor: pointer;
}
.tip {
  color: #999;
}
</style>
