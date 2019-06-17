<template>
  <section class="expert-plan skin__expert-plan">
    <p class="title">{{game.display_name}}</p>
    <div>
      <div class="m-b">
        <i :class="['radius', 'btn', {active: position.key === $route.query.position}]"
          v-for="(position, index) in positions"
          @click="handlePositionChange(position.key)"
          :key="index">{{position.label}}</i>
      </div>
      <div class="m-b">
        <i :class="['text', 'btn', {active: type.key === $route.query.scheme_type}]"
          @click="handleTypeChange(type.key)"
          v-for="(type, index) in schemeTypeList"
          :key="index">{{type.label}}</i>
      </div>
    </div>
    <div class="expert-area" v-if="currentExpert">
      <span class="expert-label">专家</span>
      <el-select
        v-model="currentExpert.expert__id"
        @change="handleExpertChange(currentExpert.expert__id, true)"
        placeholder="请选择">
        <el-option
          v-for="(item, index) in expertsList"
          :key="index"
          :label="item.expert__name"
          :value="item.expert__id"
          :disabled="item.expert__id === currentExpert.expert__id">
          <span style="float: left">{{ item.expert__name }}</span>
          <span style="float: right">{{ `${Math.ceil(item.rate * 100)}%` }}</span>
        </el-option>
      </el-select>
      <span class="win-rate red">{{`胜率 ${Math.ceil(currentExpert.rate * 100)} %`}}</span>
    </div>
    <div>
      <PlanTable @openDialog="openDialog" :plans="currentPlan" :gameCode="game.code"></PlanTable>
    </div>
    <TrackBetDialog :visible.sync="dialog.visible" :trackBetData="dialog.trackBetData"></TrackBetDialog>
  </section>
</template>

<script>
import {setting, schemeTypeList} from '@/utils/expertPlanSetting'
import { fetchExpertPlan } from '@/api'
import {map, find, findIndex} from 'lodash'
import PlanTable from './PlanTable'
import TrackBetDialog from '@/components/TrackBetDialog'
import {mapState} from 'vuex'
export default {
  props: ['game', 'gameClosed', 'schedule'],
  name: 'ExpertPlan',
  components: {
    PlanTable, TrackBetDialog
  },
  data () {
    const positions = setting[this.game.code]
    return {
      positions,
      condition: {
        game: this.game.code,
        position: positions[0].key,
        scheme_type: schemeTypeList[0].key,
        expert: ''
      },
      schemeTypeList,
      currentSchemeType: null,
      table: '',
      expertsList: null,
      currentExpert: null,
      currentPlan: [],
      loading: false,
      dialog: {
        visible: false,
        trackBetData: {
          betAmount: 10,
          schedule: null,
          playCodePattern: null,
          trackNumbers: [],
          issues: '',
          type: 1,
          bet_type: 2
        }
      },
      interval: null
    }
  },
  methods: {
    openDialog (plan) {
      if (!this.currentPositions) {
        this.$message({
          showClose: true,
          message: '此游戏目前暂不开放追投',
          type: 'error'
        })
        return
      }

      this.dialog.trackBetData.schedule = plan.schedule
      this.dialog.trackBetData.playCodePattern = this.currentPositions[findIndex(this.positions, p => p.key === this.$route.query.position)]
      this.dialog.trackBetData.trackNumbers = map(plan.predictedNums, 'label')
      this.dialog.trackBetData.type = find(this.schemeTypeList, type => type.key === this.$route.query.scheme_type).type
      this.dialog.trackBetData.issues = plan.issueStr
      this.dialog.trackBetData.bet_type = 2
      this.dialog.visible = true
    },
    handleRouteChange () {
      sessionStorage.setItem('currentPlan', JSON.stringify(this.$route.query))
      this.condition = this.$route.query
      this.getData()
    },
    handlePositionChange (key) {
      if (this.loading) {
        return
      }
      this.$router.push({query: {...this.$route.query, position: key}})
    },
    handleTypeChange (key) {
      if (this.loading) {
        return
      }
      this.$router.push({query: {...this.$route.query, scheme_type: key}})
    },
    handleExpertChange (value, manual = false) {
      if (manual && this.loading) {
        return
      }
      this.currentExpert = find(this.expertsList, expert => expert.expert__id === value)
      this.$router.push({query: {...this.$route.query, expert: value}})
    },
    getData () {
      if (this.loading) {
        return
      }
      this.loading = true
      fetchExpertPlan(this.condition).then((res) => {
        const currentExpertId = res.cur_expert.expert_id
        this.expertsList = res.all_expert
        this.currentPlan = res.cur_plans
        this.handleExpertChange(currentExpertId, false)
      }).finally(() => {
        this.loading = false
      })
    }
  },
  computed: {
    ...mapState(['bettrackPositions']),
    currentPositions () {
      const bettrackPositions = this.bettrackPositions[Number(this.$route.params.gameId)]
      return bettrackPositions ? bettrackPositions.positions : undefined
    }
  },
  created () {
    const existed = sessionStorage.getItem('currentPlan')
    if (existed) {
      let query = JSON.parse(existed)
      if (query.game === this.game.code) {
        this.$router.push({query: {
          game: this.game.code,
          position: query.position || this.positions[0].key,
          scheme_type: query.scheme_type || this.schemeTypeList[0].key
        }})
      } else {
        this.$router.push({query: this.condition})
      }
    } else {
      this.$router.push({query: this.condition})
    }

    this.interval = setInterval(() => {
      this.getData()
    }, 10 * 1000)
  },
  watch: {
    '$route': 'handleRouteChange'
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss" scoped>
.expert-plan {
  background-color: #fff;
  padding: 15px;
}

.title {
  font-size: 18px;
  color: #333;
  font-weight: 500;
  height: 32px;
  line-height: 32px;
  margin-bottom: 15px;
}

.btn {
  display: inline-block;
  color: #333;
  cursor: pointer;
  &.radius {
    font-size: 13px;
    border-radius: 12px;
    padding: 3px 10px;
    &:first-child {
      padding-left: 0;
    }
    &.active {
      padding: 3px 10px;
      color: #fff;
      cursor: default;
    }
  }
  &.text {
    font-size: 12px;
    &:not(:last-child)::after {
      content: '|';
      padding-right: 10px;
      padding-left: 10px;
      color: #333;
      font-weight: lighter;
    }
    &.active {
      font-weight: 500;
      cursor: default;
    }
  }
}

.expert {
  &-area {
    height: 35px;
    margin-bottom: 10px;
  }
  &-label {
    font-size: 13px;
    color: #666;
    margin-right: 20px;
  }
}

.win-rate {
  display: inline-block;
  padding-left: 5px;
  font-size: 12px;
}
</style>
