<template>
  <el-dialog title="确认追号"
    width="45%"
    @close="handleClose"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body>
    <el-table :data="[rawData]" stripe max-height="350">
      <el-table-column label="内容">
        <template slot-scope="scope">
          <span>{{`${scope.row.playCodePattern.display_name} - ${scope.row.trackNumbers}`}}</span>
        </template>
      </el-table-column>
      <el-table-column label="金额">
        <template slot-scope="scope">
          <el-input v-model="scope.row.betAmount"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="期数" :min-width="150">
        <template slot-scope="scope">
          {{`${scope.row.type}期 ${scope.row.issues}`}}
        </template>
      </el-table-column>
    </el-table>
    <div class="summary text-center p-t p-b" v-if="rawData.trackNumbers.length">
      共 {{ rawData.trackNumbers.length}} 组 总金额:
      <span class="red bet-amount text-bold">{{rawData.trackNumbers.length * rawData.betAmount | currency('', 1)}}</span>
    </div>
    <div class="tip">注：中奖后即停止追号</div>
    <el-alert v-if="errors" :title="errors" type="error" center :closable="false" show-icon>
    </el-alert>
    <div class="text-center m-t" v-if="!loaded">
      <el-button size="medium" :loading="loading" type="primary" @click="placeOrder">确认</el-button>
      <el-button size="medium" @click="$emit('update:visible', false)" :disabled="loading">取消</el-button>
    </div>
    <el-alert v-else title="成功下单" type="success" center :closable="false" show-icon></el-alert>
  </el-dialog>
</template>

<script>
import {sendBetTrack} from '@/api'
import {msgFormatter} from '@/utils'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    trackBetData: {
      type: Object,
      required: true
    }
  },
  data () {
    let rawData = Object.assign(this.trackBetData, {})
    return {
      loading: false,
      loaded: false,
      errors: '',
      rawData
    }
  },
  methods: {
    handleClose () {
      this.loaded = false
      this.errors = ''
      this.$emit('update:visible', false)
    },
    placeOrder () {
      if (this.loading) {
        return
      }
      this.loading = true
      this.errors = ''

      sendBetTrack(this.submitData).then(() => {
        this.loaded = true
        setTimeout(() => {
          this.$emit('update:visible', false)
        }, 1000)
      }).catch(errRes => {
        this.errors = msgFormatter(errRes)
        setTimeout(() => {
          this.$emit('update:visible', false)
        }, this.errors && this.errors.length > 20 ? 5000 : 3000)
      }).finally(() => {
        this.loading = false
      })
    }
  },
  computed: {
    submitData () {
      if (!this.rawData.playCodePattern) {
        return
      }
      return {
        bet_amount: parseFloat(this.rawData.betAmount),
        game_schedule: this.rawData.schedule.id,
        play_code_pattern: this.rawData.playCodePattern.play_code_pattern,
        track_numbers: this.rawData.trackNumbers,
        type: this.rawData.type,
        bet_type: this.rawData.bet_type
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tip {
  text-align: center;
  color: #999;
  font-size: 12px;
}
.summary {
  font-size: 12px;
  padding: 5px;
  background: #f3f4f5;
  margin-bottom: 25px;
}
</style>
