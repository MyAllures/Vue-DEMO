<template>
  <div class="wrapper">
    <transition name="slide-fade">
      <div class="inside" v-if="envelopeVisible">
        <i class="close-icon el-icon-circle-close-outline" @click="$store.dispatch('hideCampaignEnvelope')"></i>
        <div class="envelope">
          <div class="content-wrapper">
            <p class="envelope-title">{{envelope.name}}</p>
            <div class="envelope-wrapper">
              <div class="envelope-result">
                <template v-if="status==='grab_success' || status==='grab_failed'">
                  <p class="amount" v-if="status === 'grab_success'">{{envelope.winnedAmount}}</p>
                  <i v-if="status === 'grab_success'" class="icon el-icon-circle-check-outline"></i>
                  <i v-else class="icon el-icon-circle-close-outline"></i>
                  <p class="desc" v-html="envelope.desc"></p>
                </template>
                <template v-else>
                  <div class="point" v-for="(item, index) in envelope.content" :key="index">
                    <p class="title">{{item.title}}</p>
                    <template v-if="typeof(item.content) === 'string'">
                      <p class="content">{{item.content}}</p>
                    </template>
                    <template v-else-if="response.available_status.code === 'ineligible'">
                      <ul class="content">
                        <template v-for="(listItem, listIndex) in item.content">
                          <li
                            v-if="listItem.eligible===true"
                            class="list-item"
                            :key="listIndex">
                            <i class="list-icon el-icon-circle-check-outline"></i>
                            <span class="text">{{listItem.message}}</span>
                          </li>
                          <li
                            v-else
                            class="list-item"
                            :key="listIndex">
                            <i class="list-icon el-icon-circle-close-outline"></i>
                            <span class="false text">{{listItem.message}}</span>
                          </li>
                        </template>
                      </ul>
                    </template>
                    <template v-else>
                      <ul class="content">
                        <li class="list-item"
                          v-for="(listItem, listIndex) in item.content"
                          :key="listIndex"><span class="text">・{{listItem.message}}</span></li>
                      </ul>
                    </template>
                  </div>
                </template>
              </div>
              <div class="envelope-action" >
                <div v-if="status === 'need_login'" class="two-btns">
                  <div>
                    <span class="tips">已有账号</span>
                    <div class="button" @click="showLogin">
                      立即登录
                    </div>
                  </div>
                  <div>
                    <span class="tips">尚未注册</span>
                    <router-link to="/register" class="button" tag="div" @click.native.stop="$store.dispatch('hideCampaignEnvelope')">
                      免费注册
                    </router-link>
                  </div>
                </div>
                <div v-else-if="status === 'need_register'" >
                  <div>
                    <span class="tips">注册正式会员即可抢红包</span>
                    <router-link to="/register" class="button" tag="div" @click.native.stop="$store.dispatch('hideCampaignEnvelope')">
                      免费注册
                    </router-link>
                  </div>
                </div>
                <div v-else-if="status === 'available'" v-loading="status === 'loading'" @click="handleBtnClick"
                  element-loading-background="transparent"
                  class="button">
                  {{ envelope.reasons[0] || envelope.btn.label }}
                </div>
                <div v-else v-loading="status === 'loading'" @click="handleBtnClick"
                  element-loading-background="transparent"
                  :class="['button', {disabled: envelope.btn.disabled}, {small: envelope.btn.label && envelope.btn.label.length > 5}]">
                  {{envelope.btn.label}}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal"></div>
      </div>
    </transition>
  </div>
</template>

<script>
import { map } from 'lodash'
import {fetchRedEnvelopeActivities, snatchRedEnvelope} from '@/api'
import setting from '@/utils/campaignEnvelope'

export default {
  props: {
    campaignId: {
      type: Number,
      required: true
    }
  },
  data () {
    const KEYS = [
      {label: '活动介绍', key: 'description'},
      {label: '领取条件', key: 'criteria'},
      {label: '活动時間', key: 'duration_desc'}
    ]
    return {
      KEYS,
      STATUS_ENUM: setting.STATUS_ENUM,
      list: [],
      status: 'disabled',
      envelope: {
        name: '',
        content: [],
        btn: {
          label: '',
          disabled: true
        },
        reasons: [],
        winnedAmount: 0,
        desc: ''
      },
      response: {
        available_status: {
          code: '',
          messages: []
        },
        name: '',
        code: '',
        messages: [],
        amount: 0
      }
    }
  },
  watch: {
    'status': {
      handler (status) {
        const property = this.STATUS_ENUM.property[status]

        if (status === 'grab_success') {
          this.envelope.name = '领取成功'
          this.envelope.winnedAmount = this.$options.filters.currency(this.response.amount, '￥')
          this.envelope.desc = '红包已存入您的帐户<br/>稍后可在财务纪录中查询'
        } else if (status === 'grab_failed') {
          this.envelope.name = '领取失败'
          this.envelope.desc = '红包就在刚刚被抢完了<br/>明天再来吧'
        } else {
          this.envelope.name = this.response.name
        }

        this.envelope.content = this.list
        this.envelope.btn.label = property.btnLabel
        this.envelope.btn.disabled = property.btnDisabled
      },
      immediate: true
    },
    'envelopeVisible': {
      handler (visible) {
        if (visible) this.doFetch()
      },
      immediate: true
    }
  },
  methods: {
    showLogin () {
      this.$store.dispatch('hideCampaignEnvelope')
      this.$store.commit('SHOW_LOGIN_DIALOG')
    },
    envelopeEntryClick () {
      this.sendGaEvent({category: '紅包', action: '查看红包活动', label: '首页'})
      this.doFetch().then(() => {
        this.$store.dispatch('showCampaignEnvelope')
      })
    },
    handleBtnClick () {
      if (['ineligible', 'grab_failed', 'grab_success', 'already_got', 'not_yet_started', 'in_maintenance', 'failed', 'closed'].includes(this.status)) {
        this.$store.dispatch('hideCampaignEnvelope')
      } else {
        this.doSnatch()
      }
    },
    doSnatch () {
      this.sendGaEvent({category: '紅包', action: '点击抢红包', label: '首页'})
      if (!this.campaignId || this.envelope.btn.disabled) {
        return
      }
      this.status = 'loading'
      snatchRedEnvelope(this.campaignId).then((response) => {
        this.response = Object.assign(this.response, response)
        let status = response.code || ''
        if (response.code === 'success' || response.code === 'failed') {
          status = `grab_${status}`
        }
        this.status = status
      })
    },
    doFetch () {
      if (!this.campaignId) {
        return
      }
      return fetchRedEnvelopeActivities(this.campaignId).then((response) => {
        this.response = Object.assign(this.response, response)
        this.status = response.available_status.code

        this.list = map(this.KEYS, obj => {
          return {
            title: obj.label,
            content: response[obj.key]
          }
        })

        if (response.available_status.code === 'ineligible') {
          this.envelope.reasons = response.available_status.messages
        }
      })
    }
  },
  computed: {
    envelopeVisible () {
      return this.$store.state.campaignEnvelope.visible
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/vars.scss';
.wrapper {
  position: fixed;
  top: 0;
  z-index: $z-campaignenvelope;
}

.inside {
  position: fixed;
  width: 100%;
  height: 100%;
  text-align: center;
  padding-top: 10vh;
}
.envelope {
  position: relative;
  display: inline-block;
  width: 480px;
  height: 600px;
  letter-spacing: 1px;
  background-image: url('../assets/campaign_envelope/envelope.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  z-index: $z-campaignenvelope-envelope;

  .content-wrapper {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 65%;
    height: 70%;
  }

  &-title {
    font-size: 22px;
    text-shadow: 0 1px 3px rgba(255, 255, 255, 0.5);
    color: #fdebc5;
    width: 100%;
    height: 30px;
    line-height: 30px;
    background-image: url('../assets/campaign_envelope/title.svg');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }

  &-wrapper {
    height: calc(100% - 110px);
  }

  &-result {
    margin-top: 20px;
    display: flex;
    height: 260px;
    flex-direction: column;
    overflow-y: auto;
    .point {
      margin: 5px 15px;
    }
    .title {
      width: 70px;
      height: 20px;
      border-radius: 10px;
      font-size: 14px;
      color: #fdebc5;
      background-image: linear-gradient(to left, #c34141, #d13e3e);
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      padding: 1px 5px;
      margin-bottom: 5px;
    }
    .content {
      font-size: 15px;
      color: #fdebc5;
      text-align: left;
      line-height: 1.5;
      padding-left: 10px;
      .list-item {
        .text {
          vertical-align: middle;
          &.false {
            color: #fff;
          }
        }
      }
      .list-icon {
        font-size: 16px;
        color: #fff;
        vertical-align: middle;
      }
    }
    .amount {
      height: 56px;
      line-height: 56px;
      font-size: 40px;
      color: #fff;
      text-shadow: 0 1px 2px #bb463f;
    }

    .icon {
      color: #fdebc5;
      font-size: 70px;
    }

    .desc {
      font-size: 16px;
      color: #fdebc5;
      margin-top: 20px;
      line-height: 1.5;
    }
  }

  &-action {
    .tips {
      color: #fdebc5;
    }
    .short-desc {
      text-align: center;
      height: 40px;
      .text {
        color: #f8d61c;
        font-size: 12px;
        line-height: 1;
      }
    }
    .button {
      width: 90%;
      height: 42px;
      line-height: 42px;
      border-radius: 25px;
      background-image: linear-gradient(to bottom, #fffbef, #fff0c5 3%, #ffcc5a);
      box-shadow: 0px 7px 0px 0px darken(#ffca7b, 35%);
      margin: 0 auto;
      color: #c24840;
      font-size: 20px;
      cursor: pointer;
      &.small {
        font-size: 15px;
      }
      &:hover {
        background-image: linear-gradient(to bottom, darken(#fffbef, 5%), darken(#fff0c5, 5%) 3%, darken(#ffcc5a, 5%));
      }
      &.disabled {
        cursor: default;
        color: #666;
        background-image: linear-gradient(to bottom, #ffffff, #bababa);
        box-shadow: 0px 7px 0px 0px darken(#bababa, 15%);
      }
    }
  }
}

.two-btns {
  display: flex;
  > div {
    flex: 1;
  }
}
.close-icon {
  display: block;
  position: relative;
  width: 480px;
  color: #fff;
  font-size: 32px;
  margin: 0 auto;
  z-index: $z-campaignenvelope-envelope;
  text-align: right;
  cursor: pointer;
  &:hover {
    opacity: .7;
  }
}

.modal {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: .5;
  background-color: #000;
  z-index: $z-campaignenvelope-modal;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all .5s ease;
}

.slide-fade-enter, .slide-fade-leave-to{
  opacity: 0;
}
</style>
