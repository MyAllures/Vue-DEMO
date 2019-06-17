<template>
  <div class="skin__statistic statistic-container main">
    <el-tabs v-if="!this.currentStatisticMap.noDataSetting" v-model="activeTab.name" type="card">
      <el-tab-pane v-for="(tab, tabIndex) in tabs"
        :key="tabIndex"
        :style="{width: '65px'}"
        :stretch="true"
        :label="tab.label"
        :name="tab.key">
      </el-tab-pane>
    </el-tabs>
    <div :class="[{'ceiling': this.currentStatisticMap.noDataSetting}]">
      <RoadContainer :gameCode="gameCode"
        :activeSingleCategory="activeTab.data"
        :subCategories="subCategories"
        :dragonTigerSpecial="dragonTigerSpecial"
        :resultStatistic="resultStatistic">
      </RoadContainer>
    </div>
  </div>
</template>
<script>
import gameTranslator from '../utils/gameTranslator'
import _ from 'lodash'
import Tabs from './Tabs.vue'
import RoadContainer from './gameStatistic/RoadContainer'
import { statisticMap } from '../utils/statisticSetting.js'

export default {
  name: 'GameStatistic',
  props: {
    gameCode: {
      type: String
    },
    resultStatistic: {
      type: Object
    }
  },
  components: {
    Tabs, RoadContainer
  },
  data () {
    const currentStatisticMap = statisticMap[this.gameCode] || {}
    return {
      currentStatisticMap,
      subCategories: [],
      activeTab: {
        name: '',
        data: {
          key: '',
          value: ''
        }
      },
      resultSingleStatistic: {},
      dragonTigerSpecial: ''
    }
  },
  computed: {
    tabs () {
      if (!this.currentStatisticMap) {
        return []
      }

      let translator = gameTranslator[this.gameCode]
      return _.map(this.currentStatisticMap, (value, key) => {
        return {
          label: translator(key)[0],
          key
        }
      })
    }
  },
  watch: {
    'resultStatistic': {
      handler: function (resultStatistic) {
        this.resultSingleStatistic = resultStatistic.resultSingleStatistic
        this.dragonTigerSpecial = (this.gameCode.includes('ssc') || this.gameCode === 'csffc') ? '龙虎和' : '龙虎'
        if (this.tabs && !this.activeTab.name) {
          this.activeTab.name = this.tabs[0].key
        }
      },
      deep: true,
      immediate: true
    },
    'activeTab.name': {
      handler: function (name) {
        if (!name) return
        this.activeTab.data = _.find(this.tabs, tab => tab.key === name)
        if (this.currentStatisticMap.noDataSetting) {
          this.subCategories = this.currentStatisticMap.noDataSetting.subCategories
        } else {
          this.subCategories = this.currentStatisticMap[name].subCategories
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  box-sizing: border-box;
  background: #fff;
  padding: 10px;
  .ceiling {
    border-top: 1px solid #ddd;
  }
}
</style>

<style lang="scss">
.statistic-container {
  .el-tabs__header {
    margin: 0;
  }
  .el-tabs--top .el-tabs__nav-scroll {
    padding-left: 0;
  }
  .el-tabs__item {
    color: #999;
    font-size: 13px;
    padding: 0px 15px;
  }
}
</style>



