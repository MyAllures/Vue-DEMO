<template>
  <section class="trending-chart-container">
    <canvas v-show="chartVisible" id="chart-cvs" class="chart-cvs"></canvas>
    <table class="table" cellpadding="0" cellspacing="0" border="0">
      <thead class="thead">
        <tr class="tr">
          <th class="th th-main-types" colspan="2" rowspan="2"><span class="content">统计类型</span></th>
          <th :class="['th', `th-main-${key}`, `th-main-${value.colspan}`]"
            :colspan="value.colspan"
            :rowspan="value.rowspan"
            v-for="(value, key, index) in tableLayout"
            :key="index">
            <span class="content">{{value.label}}</span>
            <span class="tip" v-if="value.tip" v-popover:popover>!</span>
          </th>
        </tr>
        <tr class="tr">
          <th :class="['th', `th-sub-${col.key}`]"
            v-for="(col,index) in subCols"
            :key="index">
            <span class="content">{{col.label}}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="tr" v-if="freqStats">
          <td class="td td-freq-summary" colspan="2"><span class="content">今日总次数</span></td>
          <td :class="['td', val.key]"
            :style="{minWidth: val.width}"
            v-for="(val, index) in formattedFreqStats" :key="index">
            <span class="content" :style="{width: val.contentWidth}">{{val.value}}</span>
          </td>
        </tr>
        <tr class="tr"
          v-for="(resultFields, resultIndex) in formattedResults"
          :key="resultIndex">
          <td :class="['td', `${field.key}`]"
            v-for="(field, fieldIndex) in resultFields" :key="fieldIndex"
            :style="{width: field.width}"
            :data-label="field.label">
            <template v-if="field.key === 'td-results-issue_number' ||
             field.key === 'td-results-schedule_result'">
                <span class="content" :style="{width: field.contentWidth}">{{field.value}}</span>
            </template>
            <template v-else>
               <span class="content" :style="{width: field.contentWidth}" v-show="missingResultVisible">{{field.value}}</span>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
    <el-popover
      ref="popover"
      placement="bottom"
      width="200"
      trigger="hover">
        <p class="popover-title">回摆</p>
        <p class="popover-content">
          反向：当前期号码比上一期号码小；<br/>
          正向：当前期号码比上一期号码大；<br/>
          重号：当前期号码与上期号码相同。<br/>
        </p>
    </el-popover>
  </section>
</template>

<script>
import {map, flatMap, findIndex} from 'lodash'
export default {
  props: ['tableLayout', 'freqStats', 'results', 'lineColor', 'missingResultVisible', 'chartVisible'],
  data () {
    const subCols = flatMap(this.tableLayout, t => t.subCols)
    const numbersLength = this.tableLayout['numbers'].colspan
    const textLength = subCols.length - numbersLength
    const numberCellWidth = `${((1030 - 230 - (35 * textLength))) / numbersLength}px`
    const numberContentWidth = `${(((1030 - 230 - (35 * textLength))) / numbersLength) - 5}px`
    return {
      numberCellWidth,
      numberContentWidth,
      subCols,
      canvas: {
        strokeWidth: 2,
        width: 0,
        height: 0,
        instance: null,
        ctx: null,
        ratio: 0
      }
    }
  },
  watch: {
    'lineColor': {
      handler () {
        this.draw()
      }
    }
  },
  computed: {
    formattedFreqStats () {
      if (!this.freqStats) {
        return []
      }
      const freqStats = this.freqStats || []
      return map(this.subCols, (subCol, index) => {
        if (subCol.isDynamicWidth) {
          return {
            key: `td-freq-${subCol.key}`,
            value: freqStats[subCol.key][index] || '0',
            width: this.numberCellWidth,
            contentWidth: this.numberContentWidth
          }
        } else {
          return {
            key: `td-freq-text td-freq-${subCol.key}-${freqStats[subCol.key]}`,
            value: freqStats[subCol.key] || '0'
          }
        }
      })
    },
    formattedResults () {
      const results = this.results
      const fixedDatas = [
        {key: 'schedule_result'},
        {key: 'issue_number'}
      ]
      return map(results, (result) => {
        return map([...fixedDatas, ...this.subCols], (subCol, index) => {
          if (subCol.key === 'issue_number') {
            return {
              key: `td-results-${subCol.key}`,
              value: result[subCol.key]
            }
          }

          if (subCol.key === 'schedule_result') {
            return {
              key: `td-results-${subCol.key}`,
              value: this.$moment(result[subCol.key]).format('YYYY-MM-DD HH:mm:ss')
            }
          }

          if (subCol.isDynamicWidth) {
            const resultNumber = (result[subCol.key][index - 2]) + '' || '0'
            if (resultNumber === '0') {
              return {
                key: `winning td-results-${subCol.key}`,
                value: resultNumber,
                label: subCol.label,
                width: this.numberCellWidth,
                contentWidth: this.numberContentWidth
              }
            } else {
              return {
                key: `td-results-${subCol.key}`,
                value: resultNumber,
                width: this.numberCellWidth,
                contentWidth: this.numberContentWidth
              }
            }
          } else {
            const resultNumber = result[subCol.key] || '0'
            let key = `td-results-text td-results-${subCol.key}`
            return {
              key: resultNumber === '0' ? `winning ${key}` : key,
              value: resultNumber,
              label: subCol.label && subCol.label[0]
            }
          }
        })
      })
    }
  },
  methods: {
    clearCanvas () {
      if (this.canvas.ctx) {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      }
    },
    draw () {
      this.clearCanvas()
      const canvasCell = document.getElementsByClassName('td-freq-numbers')[0]
      const canvasWrapper = document.getElementsByClassName('th-main-numbers')[0]
      if (this.canvas.instance && canvasCell) {
        const ctx = this.canvas.instance.getContext('2d')
        this.canvas.ctx = ctx
        this.getCanvasRatio(this.canvas.ctx)
        const heightPerCell = canvasCell.getBoundingClientRect().height
        const widthPerCell = canvasCell.getBoundingClientRect().width * this.canvas.ratio
        const canvasWidth = canvasWrapper.getBoundingClientRect().width
        const canvasHeight = heightPerCell * this.results.length
        this.canvas.width = canvasWidth
        this.canvas.height = canvasHeight

        this.canvas.instance.width = canvasWidth * this.canvas.ratio
        this.canvas.instance.height = canvasHeight * this.canvas.ratio
        this.canvas.instance.style.width = canvasWidth + 'px'
        this.canvas.instance.style.height = canvasHeight + 'px'

        let chartNodeArr = []
        this.results.forEach((r, index) => {
          let points = {
            x: 0,
            y: 0
          }
          let xIndex = findIndex(r.numbers, num => num === 0) + 1
          let yIndex = ((index + 1) * heightPerCell - (heightPerCell / 2)) * this.canvas.ratio
          points.x = ((xIndex * widthPerCell - widthPerCell / 2))
          points.y = yIndex

          chartNodeArr.push(points)
        })
        this.canvas.ctx.beginPath()
        this.canvas.ctx.strokeStyle = this.lineColor
        this.canvas.ctx.lineWidth = this.canvas.strokeWidth * this.canvas.ratio
        chartNodeArr.forEach((node, index) => {
          this.canvas.ctx.lineTo(chartNodeArr[index].x, chartNodeArr[index].y)
        })
        this.canvas.ctx.stroke()
        this.canvas.ctx.closePath()
      }
    },
    getCanvasRatio (ctx) {
      let devicePixelRatio = window.devicePixelRatio || 1
      let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio || 1
      this.canvas.ratio = devicePixelRatio / backingStoreRatio
    }
  },
  updated () {
    this.draw()
  },
  mounted () {
    this.canvas.instance = document.getElementById('chart-cvs')
  }
}
</script>

<style lang="scss" scoped>
.trending-chart-container {
  position: relative;
  min-height: 400px;
}

.table {
  width: 1030px;
  color: #464646;
  background-color: #fff;
  font-size: 12px;
  border: 1px solid #ddd;
  word-wrap: break-word;
  border-collapse: collapse;
  border-spacing: 0;
  border: 0;
}

.th {
  max-height: 30px;
  overflow: hidden;
}
.tr {
  height: 30px;
  overflow: hidden;
}

.th {
  text-align: center;
  vertical-align: middle;
  background-color: #f2f2f2;
  border: 1px solid #ddd;
}

.td {
  position: relative;
  text-align: center;
  border: 1px solid #ddd;
  height: 29px;
  vertical-align: middle;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  .content {
    max-height: 29px;
    overflow: hidden;
    vertical-align: middle;
  }
}


// th
.th-main-types {
  width: auto;
  height: 59px;
  .content {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    width: auto;
    max-height: 59px;
  }
}

.th-main-numbers {
  height: 29px;
  .content {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    max-height: 29px;
  }
}

.th-main-3 {
  .content {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
  }
}

.th-main-2 {
  .content {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
  }
}

.th-sub-numbers {
  width: auto;
  height: 29px;
  .content {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    max-height: 29px;
  }
}
// td-freq content
.td-freq-summary {
  width: auto;
  .content {
    display: inline-block;
    vertical-align: middle;
    overflow: hidden;
    width: auto;
  }
}

.td-freq-numbers {
  .content {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    width: 20px;
  }
}

.td-freq-text {
  width: 34px;
  .content {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    max-width: 34px;
  }
}

// td-results content

.td-results-schedule_result {
  width: 139px;
  .content {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    width: 139px;
  }
}

.td-results-issue_number {
  width: 89px;
  .content {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    width: 89px;
  }
}

.td-results-numbers {
  .content {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
    width: 20px;
  }
}

.td-results-text {
  .content {
    display: inline-block;
    overflow: hidden;
    vertical-align: middle;
  }
}




.td-freq {
  &-numbers, &-text {
    font-weight: 500;
  }
}


.td-results {
  &-numbers {
    &.winning::after {
      content: attr(data-label);
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 20px;
      line-height: 20px;
      border-radius: 50%;
      color: #fff;
      z-index: 2;
    }
  }

  &-text {
    &.winning::after {
      content: attr(data-label);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      line-height: 32px;
      color: #fff;
    }
  }

  &-backward, &-repeat, &-forward {
    color: rgba(255, 166, 87, 0.5);
    &::after {
      background-color: #ffa657;
    }
  }
  &-odd, &-even {
    color: rgba(86, 176, 124, 0.5);
    &::after {
      background-color: #56b07c;
    }
  }
  &-front, &-behind {
    color: rgba(86, 176, 124, 0.5);
    &::after {
      background-color: #56b07c;
    }
  }
  &-bigger, &-small {
    color: rgba(97, 177, 218, 0.5);
    &::after {
      background-color: #61b1da;
    }
  }
}

.tip {
  display: inline-block;
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  line-height: 16px;
  font-weight: 700;
  border: 1px solid red;
  color: red;
  border-radius: 50%;
  cursor: default;
}

.popover-title {
  font-size : 14px;
  color: #000;
  margin-bottom: 10px;
}

.popover-content {
  font-size : 12px;
  color: #333;
  line-height: 24px;
  letter-spacing: 1.2;
}

.chart-cvs {
  position: absolute;
  top: 90px;
  left: 230px;
  z-index: 1;
}
</style>

