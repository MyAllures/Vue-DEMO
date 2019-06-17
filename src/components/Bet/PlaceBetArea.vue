<template>
  <section :class="['bet-container']">
    <div class="trackbet-ipts" v-if="isBettrack">
      <div class="ipt-wrapper">追<el-input class="trackbet-ipt"
        size="mini" type="text"
        @keypress.native="handleIntergerInputKeypress($event)"
        @blur="handleBlur($event, 1, 'type')"
        v-model="trackbetOptions.type"
        min="1" max="30"></el-input>期</div>
      <div class="ipt-wrapper">翻倍<el-input class="trackbet-ipt"
        size="mini" type="text"
        @keypress.native="handleIntergerInputKeypress($event)"
        @blur="handleBlur($event, 1, 'multiple')"
        v-model="trackbetOptions.multiple"
        min="1"></el-input></div>
    </div>

    <CardResult v-if="NiuNiuResult" :NiuNiuResult="NiuNiuResult"/>
    <div v-for="(playSection, index) in playSections"
      :class="['clearfix', 'play-section',  {'bottom': index === (playSections.length - 1)}]"
      :key="playSection.id + 'playSection' + index">
      <ul v-if="aliases[index][0]" class="m-b-sm">
        <li :class="[{
            'active': alias.active
          }, 'alias-tabitem', 'clickable']"
          v-for="(alias, tabIndex) in aliases[index]"
          :key="tabIndex"
          @click="selectAlias(aliases[index], tabIndex)">
          {{alias.name}}
        </li>
      </ul>
      <div :style="{ width: getWidthForGroup(playSection) }"
        v-for="(playgroup, playgroupIndex) in playSection.playgroups"
        :class="['group-table', {'last': (playgroupIndex + 1) % playSection.groupCol === 0}]"
        :key="'playgroup' + playgroup.id"
        v-if="playgroup.alias ? aliases[index][playgroupIndex].active : true">
        <table class="play-table"
          align="center"
          key="playgroup.code + index + '' + playgroupIndex"
          v-if="!getCustomFormatting(playgroup.code)">
          <tr v-if="!playgroup.alias">
            <th class="group-name" :colspan="playSection.playCol">
              {{playgroup.length}}{{playgroup.display_name}}
              <span class="odd-tip"
                v-if="(game.code === 'msnn' || game.code === 'pk10nn')"
                @mouseover="oddInstructionsBox.visible = true"
                @mouseout="oddInstructionsBox.visible = false">
                【赔率说明】
                <div class="odd-instruction" v-show="oddInstructionsBox.visible">
                  <p>赔率说明</p>
              ①、下注会暂时冻结下注金额的5倍，例：下注1元，冻结4元，总金额5元。开奖后连本带利一并返还。<br>
              ②、赔率：无牛（1:2）、牛一至牛六（1:2）、牛七牛八（1:3）、牛九（1:4）、牛牛（1:6）以上赔率包含本金。<br>
              注：当庄与闲点数相等时，牛六以上的点数第一个球比大小，例：（庄：15462牛八，闲：46297牛八，4比1大，闲赢）。牛六以下（含牛六）庄赢。<br>
              ③、闲赢右上角会有个赢标志，输不会显示。<br>
                </div>
              </span>
            </th>
          </tr>
          <tr
            v-for="(playChunk, playChunkIndex) in playgroup.plays"
            :key="playgroup.name + 'playChunk' + playChunkIndex">
            <td
              v-for="play in playChunk"
              :key="play.id + 'play'"
              align="center"
              :class="['clickable', 'play-ipt-td',
                {
                  active: plays[play.id] ? plays[play.id].active && !gameClosed : false
                }]"
              @click="toggleActive(plays[play.id], $event)"
              v-if="play.code">
              <el-col :span="play.value||needZodiac ? 2 : 6" class="name">
                <template v-if="(game.code==='jsk3' ||
                  game.code==='msk3'||
                  game.code==='bjk3'||
                  game.code==='gxk3'||
                  game.code === 'shk3'||
                  game.code==='hubk3'||
                  game.code==='gzk3'||
                  game.code==='hbk3'||
                  game.code==='gsk3'
                  ) && play.display_name.indexOf(',')!==-1">
                  <span
                    :class="[`play result-jsk3 resultnum-${num}`, {'small': play.display_name.split(',').length>2}]"
                    v-for="(num,index) in play.display_name.split(',')"
                    :key="index"></span>
                </template>
                <span v-else-if="play.value||needZodiac||!play.display_name.match(isNum)||noNeedBallIcon">{{play.display_name}}</span>
                <span v-else
                  :class="`play result-${game.code} resultnum-${formatNum(play.display_name)}`">
                </span>
              </el-col>
              <el-col v-if="play.value||needZodiac" :span="16" class="number">
                <span :class="[`play result-${game.code} resultnum-${num}`,'m-l-sm']" v-for="(num,index) in play.value||zodiacMap&&zodiacMap[play.display_name]" :key="index"></span>
              </el-col>
              <el-col v-if="(game.code !== 'msnn' && game.code !== 'pk10nn')" :span="play.value||needZodiac ? 2 : 6" class="odds">
                <span>{{ !gameClosed ? play.odds : '-'}}</span>
              </el-col>
              <el-col :span="play.value||needZodiac ? 4 : (game.code !== 'msnn' && game.code !== 'pk10nn') ? 12 : 18" class="input">
                <el-input v-if="gameClosed" size="mini" class="extramini" placeholder="封盘" disabled />
                <el-input v-else-if="plays[play.id].limited" size="mini" class="extramini" placeholder="已达上限" disabled />
                <el-input v-else
                  size="mini"
                  class="extramini"
                  v-model="plays[play.id].amount"
                  @keypress.native="handleAmountKeypress($event)"
                  @input="inputPlayAmount(plays[play.id].amount, play.id)"
                  @change="inputPlayAmount(plays[play.id].amount, play.id)"
                  type="text" min="1" step="10"
                />

              </el-col>
            </td>
            <td :colspan="playSection.playCol - playChunk.length" v-if="playChunk.length < playSection.playCol"></td>
          </tr>
        </table>
        <component
          :is="getCustomFormatting(playgroup.code).component"
          :playReset="playReset"
          @updatePlayForSubmit="updateCustomPlays"
          @updateMultiPlayForSubmit="updateMultiCustomPlays"
          :setting="getCustomFormatting(playgroup.code)"
          :playgroup="playgroup"
          :plays="plays"
          :gameClosed="gameClosed"
          :zodiacMap="zodiacMap"
          :gameCode="game.code"
          v-else />
      </div>
    </div>
    <!-- bet area -->
  </section>
</template>

<script>
import {mapState} from 'vuex'
import Vue from 'vue'
import _ from 'lodash'
import {validateAmount} from '@/validate'
import config from '../../config'

const CardResult = (resolve) => require(['../../components/CardResult'], resolve)
const common = (resolve) => require(['../../components/playGroup/common'], resolve)
const gd11x5Seq = (resolve) => require(['../../components/playGroup/gd11x5_pg_seq_seq'], resolve)
const hklPgShxiaoSpczdc = (resolve) => require(['../../components/playGroup/hkl_pg_shxiao_spczdc'], resolve)
const hklPgExl = (resolve) => require(['../../components/playGroup/hkl_pg_exl'], resolve)
const hklPgNtinfvrNum = (resolve) => require(['../../components/playGroup/hkl_pg_ntinfvr_num'], resolve)
const fc3dPg2df = (resolve) => require(['../../components/playGroup/fc3d_pg_2df'], resolve)
const fc3dPgIc = (resolve) => require(['../../components/playGroup/fc3d_pg_ic'], resolve)

const setActive = (play, amount) => {
  Vue.set(play, 'active', true)
  play.amount = amount
}

const cancelActive = (play) => {
  Vue.set(play, 'amount', '')
  Vue.set(play, 'active', false)
}
const reverseActive = (play, amount) => {
  if (play.active) {
    cancelActive(play)
  } else {
    setActive(play, amount)
  }
}

export default {
  components: {
    CardResult,
    common,
    hklPgShxiaoSpczdc,
    gd11x5Seq,
    hklPgExl,
    hklPgNtinfvrNum,
    fc3dPg2df,
    fc3dPgIc
  },
  props: {
    isInTabs: {
      type: Boolean,
      default: true
    },
    currentAlias: {
      type: String
    },
    betType: {
      type: String,
      default: 'normalbet'
    },
    playReset: {
      type: Boolean
    },
    playSections: {
      type: Array
    },
    game: {
      type: Object
    },
    gameClosed: {
      type: Boolean
    },
    zodiacMap: {
      type: Object
    },
    currentCategory: {
      type: Object
    },
    aliases: {
      type: Array
    },
    amount: {
      type: String
    },
    trackbetOptions: {
      type: Object
    }
  },
  data () {
    return {
      customPlayGroups: config.customPlayGroups,
      oddInstructionsBox: { visible: false },
      isNum: /^\d+$/,
      plays: {}, // just emit the confirmation plays
      validPlays: [],
      activePlays: []
    }
  },
  computed: {
    ...mapState(['latestResultMap', 'playGroups']),
    isBettrack () {
      return this.betType === 'trackbet'
    },
    NiuNiuResult () {
      const codes = ['msnn', 'pk10nn']
      if (codes.includes(this.game.code)) {
        let result = this.latestResultMap[this.game.code]
        if (result && result.extra_info) {
          _.each(result.extra_info, (value, key) => {
            _.each(value.numbers, (number, index) => {
              if (isNaN(number)) number = number.number // to init the number data
              let cardDisplayMap = {
                number,
                cardType: parseInt(4 * Math.random()) + 1 // for flower color
              }
              value.numbers[index] = cardDisplayMap
            })
          })
        }
        return this.latestResultMap[this.game.code]
      }
    },
    needZodiac () {
      const code = this.currentCategory.code
      // 正肖 合肖 特肖 连肖连尾
      return code.endsWith('txiao') || code.endsWith('shxia') || code.endsWith('ishaw') || code.endsWith('exl') || code.endsWith('pxxm')
    },
    noNeedBallIcon () {
      if (this.game && this.game.code === 'fc3d') {
        return true
      }
      const whitelist = ['bcr_ca_c2c', 'cs60cr_ca_cnrc', 'jspk10_ca_cnrc', 'er75ft_ca_cnrc', 'mlaft_ca_cnrc', 'cs600cr_ca_cnrc']
      if (this.currentCategory && whitelist.includes(this.currentCategory.code)) {
        return true
      }
      return false
    },
    currentPlayGroups () {
      return this.playGroups[this.$route.params.categoryId]
    }
  },
  watch: {
    'amount': {
      handler (amount) {
        _.each(this.plays, play => {
          if (play.active) {
            Vue.set(play, 'amount', amount)
          }
        })
      }
    },
    'currentPlayGroups': {
      handler (playgroups) {
        if (playgroups) {
          const plays = {}
          _.cloneDeep(playgroups).forEach(item => {
            item.plays.forEach(play => {
              plays[play.id] = play
              plays[play.id]['group'] = item['display_name']
              plays[play.id]['amount'] = ''
              plays[play.id]['active'] = false
            })
          })
          this.plays = plays
        }
      },
      immediate: true
    },
    'plays': {
      handler () {
        this.getActivePlays()
      },
      deep: true
    },
    'activePlays': {
      handler (activePlays) {
        if (this.isBettrack) {
          if (activePlays.length > 0) {
            _.each(this.plays, play => {
              if (play.id !== activePlays[0].id) {
                play['limited'] = true
                play['active'] = false
              }
            })
          } else {
            _.each(this.plays, play => {
              play['limited'] = false
            })
          }
        }
        if (activePlays.length > 0) {
          this.getValidPlays()
        }
      },
      deep: true
    },
    'playReset': {
      handler () {
        this.initActivePlays()
      }
    }
  },
  methods: {
    handleBlur (evt, defaultValue, key) {
      let value = parseInt(evt.target.value)
      if (Number.isInteger(value)) {
        if (value > 30) {
          value = 30
        }
        if (value === 0) {
          value = 1
        }
      } else {
        value = defaultValue
      }
      this.trackbetOptions[key] = value
    },
    triggerShortcut (option) {
      const command = option.command
      const amount = parseFloat(this.amount)
      let handleplay
      switch (command) {
        case 'all':
          handleplay = setActive
          break
        case 'reverse':
          handleplay = reverseActive
          break
        case 'cancel':
          handleplay = cancelActive
          this.$emit('clearShortCut')
          break
        default:
          handleplay = (play) => {
            if (option.num.includes(play.display_name)) {
              Vue.set(play, 'active', true)
              play.amount = amount
            } else {
              Vue.set(play, 'amount', '')
              Vue.set(play, 'active', false)
            }
          }
      }
      _.each(this.plays, play => {
        if ((!this.currentAlias && play.group === '号码') || play.alias === this.currentAlias) {
          handleplay(play, amount)
        }
      })
    },
    getActivePlays () {
      this.activePlays = _.filter(this.plays, play => play.active && (parseFloat(play.amount) > 0))
    },
    getValidPlays () {
      if (this.activePlays.length) {
        this.validPlays = _.flatMap(
          this.activePlays,
          plays => {
            if (plays.combinations && !plays.selectedOptions) {
              return _.map(plays.combinations, combination => {
                return {
                  ...plays,
                  combinations: combination
                }
              })
            } else {
              return [plays]
            }
          }
        )
      } else {
        this.validPlays = []
      }

      this.$emit('getValidPlays', this.validPlays)
    },
    formatNum (num) {
      if (num[0] === '0' && [0] !== '0') {
        return num.slice(1)
      }
      return num
    },
    handleAmountKeypress (evt) {
      let reg = /(\d)|(\.)/
      if (!reg.test(evt.key)) {
        evt.preventDefault()
      }
    },
    handleIntergerInputKeypress (evt) {
      if (!this.isNum.test(evt.key)) {
        evt.preventDefault()
      }
    },
    inputPlayAmount (iptVal, id) {
      let play = this.plays[id]
      if (!iptVal) {
        this.$nextTick(() => {
          play.amount = ''
          this.$set(this.plays, id, Object.assign({}, play))
        })
      }
      if (iptVal && !validateAmount(iptVal)) {
        this.$nextTick(() => {
          if ((iptVal.indexOf('.') !== -1) && iptVal.length === 2) {
            play.amount = `0${iptVal}`
          } else {
            let result = iptVal.slice(0, -1)
            if (result.split('.').length > 2) {
              result = '0.1'
            }
            play.amount = result
          }
          this.$set(this.plays, id, Object.assign({}, play))
        })
      }
    },
    toggleActive (play, event) {
      if ((play.active && event.target.tagName === 'INPUT') || this.gameClosed) {
        return
      }

      if (this.isBettrack && play.limited) {
        // 單選功能
        _.each(this.plays, p => {
          if (p.active) {
            Vue.set(p, 'active', !p.active)
            Vue.set(p, 'limited', !p.limited)
            Vue.set(p, 'amount', '')
          }
        })
        Vue.set(play, 'limited', false)
      }

      Vue.set(play, 'active', !play.active)
      if (play.active) {
        play.amount = parseFloat(this.amount) || ''
      } else {
        play.amount = ''
      }
    },
    updateCustomPlays (playOptions) {
      _.each(this.plays, play => {
        // if all of the options are valid, change the target play's status
        if (play.id === playOptions.activePlayId && playOptions.valid) {
          this.$set(play, 'active', true)
          this.$set(play, 'amount', this.amount)
          this.$set(play, 'isCustom', true)
          this.$set(play, 'options', playOptions.options)
          this.$set(play, 'combinations', playOptions.combinations)
          this.$set(play, 'selectedOptions', playOptions.selectedOptions)
          this.$set(this, 'showCombinationDetails', playOptions.showCombinationsPopover)
        } else {
          // if not, reset other plays
          this.$set(play, 'active', false)
          this.$set(play, 'isCustom', false)
          this.$set(play, 'options', '')
          this.$set(play, 'combinations', [])
          this.$set(play, 'selectedOptions', [])
        }
      })
    },
    updateMultiCustomPlays (playOptions) {
      _.each(this.plays, play => {
        // if all of the options are valid, change the target play's status
        if (playOptions.activePlayIds.includes('' + play.id) && playOptions.valid) {
          this.$set(play, 'active', true)
          this.$set(play, 'amount', this.amount)
          this.$set(play, 'isCustom', true)
          this.$set(play, 'options', playOptions.options)
          this.$set(play, 'combinations', playOptions.combinations['' + play.id])
          this.$set(play, 'selectedOptions', playOptions.selectedOptions)
          this.$set(play, 'hideName', true)
        } else {
          // if not, reset other plays
          this.$set(play, 'active', false)
          this.$set(play, 'isCustom', false)
          this.$set(play, 'options', '')
          this.$set(play, 'combinations', [])
          this.$set(play, 'selectedOptions', [])
        }
      })
    },
    getCustomFormatting (groupCode) {
      let getCustom = _.find(this.customPlayGroups, item => {
        return item.code.includes(groupCode)
      })
      return getCustom
    },
    getWidthForGroup (playSection) {
      // 0.01 is margin-right for each group
      return ((1 - (playSection.groupCol - 1) * 0.01) / playSection.groupCol) * 100 + '%'
    },
    selectAlias (group, tabIndex) {
      let oldAlias
      group.forEach(alias => {
        if (alias.active) {
          oldAlias = alias.name
          alias.active = false
        }
      })

      // reset 'active' for plays in inactive playgroups
      _.each(_.filter(this.plays, play => play.active && play.alias === oldAlias), play => {
        this.$set(play, 'active', false)
        this.$set(play, 'amount', '')
      })

      group[tabIndex].active = true
      this.$emit('clearShortCut')
    },
    initActivePlays () {
      _.each(this.plays, play => {
        if (play.active) {
          Vue.set(play, 'amount', '')
          Vue.set(play, 'active', false)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../style/gameplay.scss";

.bet-container {
  overflow: auto;
}

.play-section {
  &.bottom {
    table {
      margin-bottom: 0;
    }
  }
}
.alias-tabitem {
  box-sizing: border-box;
  margin-right: -1px;
  display: inline-block;
  padding: 5px 15px;
  background: #fff;
  color: #666;
  border: 1px solid #dedede;
  &.active {
    color: #fff;
  }
}

.odd-instruction {
  position: absolute;
  left: 0;
  width: 350px;
  padding: 5px;
  border: 1px solid #ddd;
  background: azure;
  text-align: left;
  z-index: 2;
  line-height: 20px;
}

.odd-tip {
  position: relative;
}

.extramini  /deep/ .el-input__inner {
  width: 90%;
  height: 26px;
}

.el-input /deep/ .el-input__inner{
  height: 30px;
  border: solid 1px #c8c8c8;
  &:disabled {
    padding: 0 10px;
    text-align: center;
  }
}

.trackbet-ipts {
  text-align: center;
  margin: 10px 0;
  font-size: 12px;
  color: #333;
  .ipt-wrapper {
    display: inline-block;
    width: 150px;
  }
  .trackbet-ipt {
    width: 100px;
    height: 32px;
    margin-right: 5px;
    margin-left: 5px;
  }
}

</style>
