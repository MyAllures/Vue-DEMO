<template>
  <section>
    <div class="top">
      <Tabs v-if="tabs.length > 0"
        type="text"
        :items="tabs"
        @clicked="handleTabSelect"
        ref="tabs">
      </Tabs>
      <div>
        <Cumulative :cumulative="cumulative"></Cumulative>
      </div>
    </div>
    <div class="road-box">
      <DaRoad
        :cumulative="cumulative"
        :dragonTigerSpecial="dragonTigerSpecial"
        :statistic="resultStatistic.daRoadStatistic"
        :activeTab="activeTab"/>
      <div class="roads-row">
        <BigEyeRoad v-if="hasXiaSanRoad && resultStatistic.bigEyeRoadStatistic"
          :dragonTigerSpecial="dragonTigerSpecial"
          :statistic="resultStatistic.bigEyeRoadStatistic"
          :activeTab="activeTab">
        </BigEyeRoad>
        <LittleRoad v-if="hasXiaSanRoad && resultStatistic.littleRoadStatistic"
          :dragonTigerSpecial="dragonTigerSpecial"
          :statistic="resultStatistic.littleRoadStatistic"
          :activeTab="activeTab">
        </LittleRoad>
        <BeetleRoad v-if="hasXiaSanRoad && resultStatistic.beetleRoadStatistic"
          :dragonTigerSpecial="dragonTigerSpecial"
          :statistic="resultStatistic.beetleRoadStatistic"
          :activeTab="activeTab">
        </BeetleRoad>
      </div>
      <JupanRoad v-if="hasXiaSanRoad && resultStatistic.jupanRoadStatistic"
        :dragonTigerSpecial="dragonTigerSpecial"
        :statistic="resultStatistic.jupanRoadStatistic"
        :activeTab="activeTab"/>
    </div>
  </section>
</template>

<script>
import Tabs from '../Tabs.vue'
import DaRoad from './DaRoad.vue'
import JupanRoad from './JupanRoad.vue'
import BigEyeRoad from './BigEyeRoad.vue'
import LittleRoad from './LittleRoad.vue'
import BeetleRoad from './BeetleRoad.vue'
import Cumulative from './Cumulative.vue'
import gameTranslator from '../../utils/gameTranslator'
import {xiaSanRoadGames, CUMULATIVE_KEYS} from '../../utils/statisticSetting'
import { each, map, sortBy } from 'lodash'

export default {
  data () {
    return {
      activeTab: {
        key: '',
        label: ''
      },
      cumulative: [],
      tabs: []
    }
  },
  components: {
    Tabs, DaRoad, JupanRoad, Cumulative, BeetleRoad, BigEyeRoad, LittleRoad
  },
  props: {
    activeSingleCategory: {
      type: [String, Object]
    },
    resultStatistic: {
      type: Object
    },
    subCategories: {
      type: Array
    },
    gameCode: {
      type: String
    },
    dragonTigerSpecial: {
      type: String
    }
  },
  methods: {
    getTabTranslatedLabel (key) {
      if (key === 'balls_front_rear_count_cp') {
        return '前后和'
      }
      if (key === 'sum_of_ball_five_element') {
        return '五行'
      }
      if (key === 'balls_odd_even_cp') {
        return '单双和'
      }
      if (key === 'sum_of_ball_odd_even') {
        return '总和单双'
      }
      if (key === 'sum_of_ball_than_size') {
        return '总和大小'
      }
      if (key.includes('sum_number_odd_even')) {
        return '合数单双'
      } else if (key.includes('tail_than_size')) {
        return '尾数大小'
      } else if (key.includes('odd_even')) {
        return '单双'
      } else if (key.includes('than_size')) {
        return '大小'
      } else if (key.includes('dragon_tiger')) {
        return this.dragonTigerSpecial
      } else if (key.includes('color_wavelength')) {
        return '色波'
      }
    },
    handleTabSelect (tab) {
      this.activeTab = tab
    },
    createCumulative () {
      let cumulativeMap = this.resultStatistic.resultSingleStatistic[this.activeTab.key]
      let arr = []

      each(cumulativeMap, (value, key) => {
        let sortIndex = 1
        each(CUMULATIVE_KEYS, (keys, index) => {
          if (keys.includes(key)) {
            sortIndex = index
          }
        })
        if (!sortIndex) return
        arr.push({
          text: gameTranslator.typeFilter(key),
          value: value || 0,
          key,
          sortIndex
        })
      })

      this.cumulative = sortBy(arr, 'sortIndex')
    }
  },
  watch: {
    'activeTab': {
      handler (activeTab) {
        if (!activeTab.key) return
        this.createCumulative()
        this.$refs['tabs'] && this.$refs['tabs'].setActiveTab(activeTab.key)
      },
      deep: true,
      immediate: true
    },
    'subCategories': {
      handler (subCategories) {
        if (!subCategories.length) return
        this.tabs = map(subCategories, categoryName => {
          let label = this.getTabTranslatedLabel(categoryName)
          if (label.includes(this.activeSingleCategory.label)) {
            label = label.replace(this.activeSingleCategory.label, '') || label
          }
          return {
            key: categoryName, label
          }
        })
        if (this.activeTab.key) {
          let theSameCategory = subCategories.find((categoryName) => this.activeTab.label === this.getTabTranslatedLabel(categoryName))

          if (theSameCategory) {
            this.activeTab = {
              key: theSameCategory,
              label: this.getTabTranslatedLabel(theSameCategory)
            }
          } else {
            this.activeTab = this.tabs[0]
          }
        } else {
          this.activeTab = this.tabs[0]
        }
      },
      immediate: true
    }
  },
  computed: {
    hasXiaSanRoad () {
      return xiaSanRoadGames.includes(this.gameCode)
    }
  }
}
</script>
<style lang="scss">
.road-ball {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: transparent;
  &.red, &.dragon, &.bigger, &.odd, &.odd_more, &.front_part_more, &.rule-1 {
    color: #eb2020;
  }
  &.blue, &.tiger, &.smaller, &.even, &.even_more, &.rear_part_more, &.rule-0 {
    color: #166fd8;
  }
  &.green, &.equal {
    color: #6bc23a;
  }
  &.gold, &.wood, &.water, &.fire, &.earth, &.text {
    &::before {
      content: attr(data-type);
      position: absolute;
      top: 0;
      left: 0;
      font-size: 13px;
      color: #333;
    }
  }
}

.road-table {
  &-data {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    text-align: center;
    table-layout: fixed;
    .tr {
      height: 35px;
    }
    .cell {
      box-sizing: border-box;
      width: 4%;
      border: 1px solid #ddd;
      &.stripe {
        background-color: #fafafa;
      }
    }
  }
  &-head {
    box-sizing: border-box;
    font-size: 14px;
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background-color: #eee;
    border-right: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
  }
}
</style>

<style lang="scss" scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  padding-left: 15px;
  padding-right: 15px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

.roads-row {
  display: flex;
}
</style>
