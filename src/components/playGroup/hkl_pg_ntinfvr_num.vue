<template>
  <div>
    <table class="play-table" align="center" >
      <tr class="group-name">
        <td>种类</td>
        <td>自选不中</td>
      </tr>
      <tbody class="tbody">
        <tr>
          <td align="center">赔率</td>
          <td>
            <span v-if="!gameClosed" class="odds">{{activePlayOdds}}</span>
            <span v-else class="disabled">封盘</span>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="play-table">
      <tr class="group-name">
        <td :colspan="customPlayGroup.cols" align="center">
          <div v-if="!gameClosed">请勾选</div>
          <div v-else>封盘</div>
        </td>
      </tr>
      <tr
        v-for="(row,index) in optionGroup"
        :key="'row'+index">
        <td
          @click.prevent="selectOption(option, $event)"
          @mouseover="option.hover = true"
          @mouseleave="option.hover = false"
          v-for="option in row"
          :key="option.num + 'option'"
          :width="(1 / customPlayGroup.cols) * 100 + '%'" align="center" :class="['option-td',
            {
              hover: option.hover,
              active: option.selected && !gameClosed
            }
          ]">
          <el-col :span="12" class="name">
            <span :class="[`play result-${gameCode} resultnum-${option.num}`]"></span>
          </el-col>
          <el-col :span="12" class="checkbox input">
            <el-checkbox v-model="option.selected" v-if="!gameClosed"></el-checkbox>
            <el-checkbox disabled v-else></el-checkbox>
          </el-col>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  props: {
    setting: Object,
    playgroup: {
      type: Object
    },
    plays: {
      type: Object
    },
    gameClosed: {
      type: Boolean
    },
    playReset: {
      type: Boolean
    },
    gameCode: {
      type: String
    }
  },
  name: 'hklPgNtinfvrNum',
  data () {
    const customPlayGroup = this.setting
    const options = customPlayGroup.options
    const rows = Math.ceil(options.length / customPlayGroup.cols)

    let optionGroup
    if (customPlayGroup.transpose) {
      const cols = customPlayGroup.cols
      optionGroup = _.flatMap(options.slice(0, rows), n => {
        let index = 0
        let result = []
        while (index < cols) {
          let num = n * cols + index + 1
          if (num > options.length) {
            break
          }
          result.push({
            num: num,
            selected: false,
            hover: false
          })
          index++
        }
        return [result]
      })
    } else {
      optionGroup = _.flatMap(options.slice(0, rows), n => {
        let index = 0
        let result = []
        while (index < customPlayGroup.cols) {
          result.push({
            num: n + (rows) * index,
            selected: false,
            hover: false
          })
          index++
        }
        return [result]
      })
    }
    return {
      optionGroup,
      customPlayGroup,
      combinations: [],
      valid: false
    }
  },
  computed: {
    selectedOptions () {
      return _.filter(_.flatten(this.optionGroup), option => {
        return option.selected
      })
    },
    activePlayOdds () {
      return this.activePlaying.odds || '--'
    },
    activePlaying () {
      let activePlay = Object.values(this.plays).find(p => p.rules.min_opts === this.selectedOptions.length)
      if (activePlay) {
        return {
          odds: activePlay.odds,
          id: activePlay.id,
          display_name: activePlay.display_name
        }
      } else {
        return {}
      }
    }
  },
  watch: {
    'selectedOptions': function () {
      this.updateForSubmit()
    },
    'playReset': function () {
      _.flatten(this.optionGroup).forEach(option => {
        option.selected = false
      })
      this.combinations.length = 0
    }
  },
  methods: {
    updateForSubmit () {
      this.valid = !!this.activePlaying.id
      this.$emit('updatePlayForSubmit', {
        activePlayId: this.activePlaying.id,
        selectedOptions: this.selectedOptions.map(option => {
          return {
            num: option.num
          }
        }),
        combinations: ['1'], // rule is always 1 combination
        valid: this.valid
      })
    },
    selectOption (option, event) {
      if (this.gameClosed) {
        return false
      }
      option.selected = !option.selected
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../style/vars.scss";
@import "../../style/gameplay.scss";

.group-name {
  cursor: pointer;
}
.odds {
  line-height: $cell-height;
  color: $red;
  text-align: center;
  display: block;
  font-weight: 700;
  border: none;
}
.disabled {
  color: #ccc;
  text-align: center;
  display: block;
}
.tbody {
  .odds {
    width: 100%;
  }
  td {
    width: 50%;
    font-weight: bold;
  }
  background: #fff;
}
.option-td {
  cursor: pointer;
}
.checkbox {
  border-left: $cell-border;
}
</style>
