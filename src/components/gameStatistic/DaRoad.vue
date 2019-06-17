<template>
  <div v-if="tableCells">
    <div class="road-table-head">大路</div>
    <table class="road-table-data">
      <tr class="tr">
        <td :class="['cell', {'stripe': groupIndex%2===0}]" v-for="(cell, groupIndex) in tableCells" :key="groupIndex">
          <p v-for="(data, index) in cell" :key="index">
            <span :class="[getClass(data), 'road-ball']" :data-type="data | typeFilter"></span>
          </p>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import {clone} from 'lodash'
import gameTranslator from '../../utils/gameTranslator.js'
export default {
  props: {
    statistic: {
      type: Object
    },
    activeTab: {
      type: Object
    },
    dragonTigerSpecial: {
      type: String
    },
    cumulative: {
      type: Array
    }
  },
  filters: {
    typeFilter (val) {
      return gameTranslator.typeFilter(val)
    }
  },
  data () {
    return {
      tableCells: []
    }
  },
  methods: {
    getClass (data) {
      let key = this.cumulative.find((c) => c.key === data)
      if (key) {
        return `${data}`
      } else {
        return 'text'
      }
    }
  },
  watch: {
    'activeTab.key': {
      handler () {
        if (!this.statistic) {
          return []
        }
        let cells = clone(this.statistic[this.activeTab.key]) || null
        if (cells) {
          cells.reverse()
          if (cells.length < 25) {
            for (let i = 0, length = 25 - cells.length; i < length; i++) {
              cells.push([])
            }
          } else {
            cells.length = 25
          }
        }
        this.tableCells = cells
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.road-table-head {
  border-top: 1px solid #e0e0e0;
}

.road-table-data .cell {
  min-height: 150px;
  padding-top: 5px;
}

.road-table-data {
  min-height: 150px;
}

.road-ball {
  display: inline-block;
  box-sizing: border-box;
  border: 2px solid currentColor;
}
</style>
