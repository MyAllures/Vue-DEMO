<template>
  <div v-if="tableCells">
    <div class="road-table-head">小路</div>
    <table class="road-table-data" cellpadding="0" cellspacing="0">
      <tr class="tr" v-for="(cell, trIndex) in tableCells" :key="trIndex">
        <td :class="['cell', {'stripe': tdIndex%2!==0}]" v-for="(td, tdIndex) in cell" :key="tdIndex">
          <span :class="['road-ball', td]"></span>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import {clone, maxBy, take, reverse} from 'lodash'
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
        const colCount = 20
        let rawCells = clone(this.statistic[this.activeTab.key])
        if (!this.statistic || !rawCells) {
          this.tableCells = null
          return
        }

        rawCells = take(reverse(rawCells), colCount)

        let rowCount = maxBy(rawCells, arr => arr.length).length
        if (rowCount < 6) { rowCount = 6 }
        let cells = Array.from(new Array(rowCount), n => [])

        for (let i = 0; i < colCount; i++) {
          for (let j = 0; j < rowCount; j++) {
            if (!rawCells[i]) {
              rawCells[i] = []
            }
            let cell = ''
            if (rawCells[i][j] === 0) {
              cell = '0'
            } else if (rawCells[i][j] === 1) {
              cell = '1'
            } else {
              cell = 'none'
            }
            cells[j].push(`rule-${cell}`)
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
  width: 5%;
}
.road-ball {
  vertical-align: middle;
  background-color: currentColor;
}
.road-table-data .tr {
  height: 15px;
}
.road-ball {
  width: 8px;
  height: 8px;
  box-sizing: border-box;
}
</style>
