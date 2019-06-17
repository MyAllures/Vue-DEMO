<template>
  <section class="plan-table-wrapper">
    <table class="plan-table">
      <tr class="header-row">
        <th>期号</th>
        <th>预测</th>
        <th>结果</th>
        <th>追投</th>
      </tr>
      <tr class="body-row" v-for="(row, index) in formattedPlans" :key="index">
        <td>{{row.issueStr}}</td>
        <td>
          <span :class="[{red:num.winning}, 'number']"
            v-for="(num, index) in row.predictedNums"
            :key="index">{{num.label}}</span>
        </td>
        <td>
          <span :class="row.status.class">
            {{row.status.label}}
          </span>
        </td>
        <td>
          <template v-if="row.trackAvailable">
            <el-button @click.native="$emit('openDialog', row)">追投</el-button>
          </template>
          <template v-else>
            <span class="past-issue">往期</span>
          </template>
        </td>
      </tr>
    </table>
  </section>
</template>

<script>
import {map} from 'lodash'

export default {
  name: 'PlanTable',
  props: {
    plans: {
      type: Array,
      required: true,
      default: [{}, {}, {}]
    },
    gameCode: {
      type: String,
      required: true
    }
  },
  data () {
    const statusMap = {
      '待开': 'waiting',
      '开奖延迟': 'delay',
      '挂': 'lose',
      '中': 'win'
    }
    return {
      statusMap
    }
  },
  methods: {},
  computed: {
    formattedPlans () {
      return map(this.plans, plan => {
        const rawStatus = this.statusMap[plan.result.status]

        let status = {}
        let predictedNums = []
        let issueStr = ''
        let trackAvailable = (rawStatus === 'waiting')
        let schedule = {id: plan.game_schedule[0]}
        issueStr = `${plan.issue_number_short.join(' - ')} 期`

        if (rawStatus === 'win') {
          status.label = ''
          status.class = `win-ball result-${this.gameCode} resultnum-${plan.result.win_bet}`
        } else {
          status.label = plan.result.status
          status.class = `win-text ${rawStatus}`
        }

        predictedNums = map(plan.prediction, num => {
          return {
            label: num,
            winning: num === plan.result.win_bet
          }
        })

        return {
          status,
          predictedNums,
          issueStr,
          trackAvailable,
          schedule
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-table-wrapper {
  min-height: 300px;
}
.plan-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 12px;
  color: #333;
  .header-row {
    height: 30px;
  }
  .body-row {
    height: 40px;
  }
  th {
    background-color: #f2f2f2;
    border: solid 1px #dddddd;
    vertical-align: middle;
  }
  td {
    border: solid 1px #dddddd;
    vertical-align: middle;
  }
}
.win-ball {
  display: inline-block;
}
.win-text.lose {
  color: #bfbfbf;
}
.past-issue {
  color: #bfbfbf;
}
.number {
  &:not(:last-child)::after {
    content: ', ';
    color: #333;
  }
}

.summary {
  font-size: 12px;
  padding: 5px;
  background: #f3f4f5;
}
</style>
