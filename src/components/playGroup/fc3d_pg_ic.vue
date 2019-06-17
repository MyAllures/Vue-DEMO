<template>
  <div>
    <table class="play-table" align="center" >
      <tr class="group-name">
        <td>种类</td>
        <td>{{playgroup.display_name}}</td>
      </tr>
      <tbody class="tbody">
        <tr>
          <td align="center">赔率</td>
          <td>
            <span v-if="!gameClosed" class="odds">{{this.activePlay?this.activePlay.odds:'--'}}</span>
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
      <tr v-for="(row, rowIndex) in optionGroup" :key="rowIndex" align="center">
        <td
          @click="selectOption(option, $event)"
          @mouseover="option.hover = true"
          @mouseleave="option.hover = false"
          v-for="(option, optionIndex) in row"
          :key="optionIndex"
          :width="(1 / customPlayGroup.cols) * 100 + '%'" align="center" :class="['option-td',
            {
              hover: option.hover,
              active: option.selected && !gameClosed
            }
          ]">
          <el-col :span="3" class="name">
            <span>
              <span>{{option.num}}</span>
            </span>
          </el-col>
          <el-col :span="21" class="checkbox input">
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
  name: 'fc3dPgIc',
  data () {
    const customPlayGroup = this.setting
    const options = customPlayGroup.options
    const rows = Math.ceil(options.length / customPlayGroup.cols)
    const optionGroup = _.flatMap(options.slice(0, rows), n => {
      let index = 0
      let result = []
      while (index < customPlayGroup.cols) {
        let num = n + (rows) * index
        result.push({
          num: num,
          selected: false,
          hover: false
        })
        index++
      }
      return [result]
    })
    const playMap = {}
    _.each(this.plays, play => {
      playMap[play.rules.max_opts] = play
    })
    return {
      optionGroup,
      customPlayGroup,
      combinations: [],
      valid: false,
      playMap
    }
  },
  computed: {
    selectedOptions () {
      return _.filter(_.flatten(this.optionGroup), option => {
        return option.selected
      })
    },
    activePlay () {
      const activePlay = this.playMap[this.selectedOptions.length]
      if (activePlay) {
        return activePlay
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
    }
  },
  methods: {
    updateForSubmit () {
      let numbers = this.selectedOptions.map(option => option.num)
      let rules = this.activePlay ? this.activePlay.rules : ''
      this.valid = rules && numbers.length >= rules.min_opts

      this.$emit('updatePlayForSubmit', {
        activePlayId: this.activePlay ? this.activePlay.id : '',
        selectedOptions: this.selectedOptions.map(option => {
          return {
            num: option.num
          }
        }),
        combinations: ['1'],
        valid: this.valid
      })
    },
    selectOption (option, event) {
      if (this.gameClosed) {
        return false
      }
      event.preventDefault()
      option.selected = !option.selected
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../style/vars.scss";
@import "../../style/gameplay.scss";

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
