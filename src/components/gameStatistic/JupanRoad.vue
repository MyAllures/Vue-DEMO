<template>
  <div>
    <div class="road-table-head">珠盘路</div>
    <table class="road-table-data">
      <tr class="tr" v-for="(cell, trIndex) in tableCells" :key="trIndex">
        <td :class="['cell', {'stripe': tdIndex%2!==0}]" v-for="(td, tdIndex) in cell" :key="tdIndex">
          <span :class="['road-ball', td]"></span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import {clone} from 'lodash'
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
    }
  },
  data () {
    return {
      tableCells: []
    }
  },
  watch: {
    'activeTab.key': {
      handler () {
        if (!this.statistic) {
          return []
        }

        let rawCells = clone(this.statistic[this.activeTab.key])
        rawCells.reverse()
        let cells = [[], [], [], [], [], []]

        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 6; j++) {
            if (!rawCells[i]) {
              rawCells[i] = []
            }
            cells[j].push(rawCells[i][j] || '')
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
.road-table-data .cell {
  vertical-align: middle;
}
.road-ball {
  vertical-align: middle;
  background-color: currentColor;
}
</style>
