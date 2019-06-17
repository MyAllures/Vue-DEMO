<template>
  <div class="content">
    <template v-if="isLoading">
      <i class="el-icon-loading"></i>
    </template>
    <template v-else>
      <div class="section">
        <div class="section-title">今日累计有效投注</div>
        <div class="section-content no-background">
          <div class="count">¥{{ redEnvData.bet_amount }}</div>
          <div class="progress-bar">
            <div class="limit from">¥{{ currentBetLevelAmount }}</div>
            <div class="limit to">¥{{ nextBetLevelAmount }}</div>
            <div class="progress">
              <div class="progress-inner" :style="{ width: `${progressWidth}%` }"></div>
            </div>
          </div>
          <p v-if="redEnvData.next_level === 'finished'">今日返利红包已领完，明天继续加油</p>
          <p v-else>{{ redEnvData.next_level }}</p>
        </div>
      </div>
      <div class="section available" :class="{ collapse: openedData }">
        <div class="section-content no-background">
          <div class="count highlight" :class="{ gray: !redEnvRemain }">{{ redEnvRemain }}</div>
          <div class="desc highlight" :class="{ gray: !redEnvRemain }">今日未拆红包个数</div>
        </div>
      </div>
      <div class="divider"></div>
      <transition name="reward-block" mode="in-out">
        <div class="reward-block" v-if="isShowResult">
          <div class="section">
            <div class="section-title">
              <span v-if="isError">领取失败</span>
              <span v-else>领取成功</span>
            </div>
            <img class="reward-error" src="../../../assets/red-envelope-v2/icon-fail.svg" v-if="isError" />
            <div class="section-content no-background" v-else>
              <div class="count highlight">¥{{ openedData.amount }}</div>
            </div>
          </div>
          <p class="prompt">
            <span v-if="isError">{{ openedData.available_status }}</span>
            <span v-else>可在优惠和红包纪录中查询<a href="#" class="highlight" @click.prevent="$emit('goto', '/account/finance/discount_record')">红包纪录</a></span>
          </p>
        </div>
      </transition>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { fetchActBoost } from '@/api'

export default {
  name: 'BoostRedEnv',
  props: {
    act: Object,
    openedData: Object,
    reLoading: Boolean
  },
  data: () => ({
    isLoading: true,
    redEnvData: null
  }),
  mounted () {
    this.fetchActBoost()
  },
  methods: {
    fetchActBoost () {
      fetchActBoost().then(response => {
        this.redEnvData = response
        this.$emit('remain', response.remain_envelope_count)
        this.$nextTick(() => {
          this.isLoading = false
        })
      })
    }
  },
  computed: {
    ...mapState('actv2', {
      remainCount: state => state.boost.count
    }),
    betInterval () {
      return this.act.levels ? this.act.levels.map(level => level.bet_amount_min) : []
    },
    nextBetLevelIndex () {
      const index = this.betInterval.findIndex(amount => amount > this.redEnvData.bet_amount)
      return index === -1 ? this.betInterval.length - 1 : index
    },
    currentBetLevelAmount () {
      return this.nextBetLevelIndex === 0 ? 0 : this.betInterval[this.nextBetLevelIndex - 1]
    },
    nextBetLevelAmount () {
      return this.betInterval[this.nextBetLevelIndex]
    },
    progressWidth () {
      if (!this.redEnvData) {
        return 0
      }
      const percent = (this.redEnvData.bet_amount - this.currentBetLevelAmount) / (this.nextBetLevelAmount - this.currentBetLevelAmount) * 100
      return Math.min(percent, 100)
    },
    redEnvRemain () {
      if (this.remainCount === false) {
        return this.redEnvData ? this.redEnvData.remain_envelope_count : 0
      }
      return this.remainCount
    },
    isShowResult () {
      return this.openedData && !this.reLoading
    },
    isError () {
      return !this.openedData || !this.openedData.amount
    }
  },
  watch: {
    redEnvRemain (val) {
      this.$emit('remain', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  overflow: hidden !important;
}
.section-content {
  text-align: center !important;
}
.count {
  font-size: 24px;
  font-weight: bold;
}
.highlight {
  color: #df4238;
}
.gray {
  color: #999;
}
.progress-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 300px;
  margin: 10px auto 5px;
  overflow: hidden;

  .limit {
    font-size: 12px;
    font-weight: bold;
    color: #c99f64;
  }
  .progress {
    flex: 0 0 100%;
    height: 5px;
    background-color: #f6e5c9;
    margin-bottom: 10px;
    border-radius: 7px;
  }
  .progress-inner {
    height: 8px;
    background-image: linear-gradient(to right, #ffe0ac, #df4238);
    margin-top: -1.5px;
    border-radius: 7px;
    animation: progress-in 1.5s ease-out;
  }
}
@keyframes progress-in {
  from { max-width: 0%; }
  to { max-width: 100%; }
}
.available {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 262px;

  &.collapse {
    min-height: 100px;
    transition: min-height .5s cubic-bezier(.47, 0, .75, .72);
  }
  .count {
    margin-bottom: 5px;
  }
}
.divider {
  width: 480px;
  height: 1px;
  margin: 25px auto;
  background: #f8e7cc;
}
.reward-error {
  display: block;
  width: 35px;
  height: 35px;
  margin: 1px auto 0;
}
.reward-block {
  position: absolute;
  width: 100%;
}
.prompt {
  color: #6d6452;
  animation: fadeInUp .2s .5s linear backwards;

  a {
    text-decoration: underline;
  }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

.reward-block-enter  {
  transform: translateY(91px);
  opacity: 0;
}
.reward-block-leave-to  {
  opacity: 0;
}
.reward-block-enter-active {
  transition: all .5s ease-out;
}
.reward-block-leave-active {
  transition: opacity .2s .2s linear;
}
</style>
