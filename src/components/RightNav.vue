<template>
  <div class="column skin__right-nav" :class="{'invisible': !navVisible}">
    <div class="wrapper">
      <div
        @mouseleave="leaveItem(item)"
        @click="item.onClick"
        :ref="`ref-${item.key}`"
        :class="['item', {'active': activeKeys.includes(item.key)}]"
        v-for="(item, index) in displayItems"
        :key="index">
        <img :src="item.icon" :alt="item.label" :width="item.width || 32">
        <p class="label">{{item.label}}</p>
        <RedPoint v-if="item.showRedPoint && item.showRedPoint()" />
        <div class="bubble" :ref="`bubble-${item.key}`" :style="item.bubble.offset" :class="item.bubble.className">
          <div class="box">
            <p class="label">{{item.bubble.label}}</p>
            <template v-if="item.bubble.addition">
              <div class="number" v-if="item.bubble.addition.show">{{ item.bubble.addition.content }}</div>
              <div class="label" v-if="item.key === 'qq'">或用手机 QQ 扫码</div>
              <qrcode class="qrcode"
                :options="{width: '120', height: '120'}"
                v-if="item.bubble.addition.type === 'qrcode'"
                :value="item.bubble.addition.content"></qrcode>
              <p class="phone" v-if="item.bubble.addition.type === 'phone'">{{item.bubble.addition.content}}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="toggle" @click="toggle">
      <img src="../assets/icon_double_angle.svg" width="12"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { filter } from 'lodash'
import RedPoint from '@/components/RedPoint'
export default {
  props: {
    systemConfig: {
      type: Object
    }
  },
  components: {
    RedPoint
  },
  data () {
    return {
      navVisible: true,
      items: [
        {
          icon: require('@/assets/right_menu/icon_redenvelope_active.svg'),
          width: 32,
          label: '抢红包',
          key: 'envelope',
          onClick: this.envelopeEntryClick,
          bubble: {
            label: '抢红包',
            offset: {}
          }
        },
        {
          icon: require('@/assets/right_menu/icon_customerservice.svg'),
          label: '在线客服',
          key: 'service',
          showRedPoint: () => this.unread,
          onClick: this.serviceEntryClick,
          bubble: {
            label: '联系在线客服',
            offset: {}
          }
        },
        {
          icon: require('@/assets/right_menu/icon_qq.svg'),
          label: 'QQ客服',
          onClick: () => {},
          key: 'qq',
          bubble: {
            label: '请联系客服QQ',
            addition: {
              type: 'qrcode',
              show: true,
              content: this.systemConfig.openAccountConsultingQQ
            },
            offset: {}
          }
        },
        {
          icon: require('@/assets/right_menu/icon_phone.svg'),
          label: '客服电话',
          onClick: () => {},
          key: 'phone',
          bubble: {
            label: '电话客服',
            addition: {
              type: 'phone',
              content: this.systemConfig.contactPhoneNumber
            },
            offset: {}
          }
        },
        {
          icon: require('@/assets/right_menu/icon_qrcode.svg'),
          label: 'App下载',
          onClick: () => {},
          key: 'app',
          bubble: {
            className: '',
            label: '扫码下载手机 App 购彩更方便',
            addition: {
              type: 'qrcode',
              content: this.systemConfig.appDownloadUrl
            },
            offset: {}
          }
        }
      ],
      displayItems: []
    }
  },
  computed: {
    ...mapState('customerService', {
      unread: state => state.unread
    }),
    envelopeEntryVisible () {
      return this.systemConfig.envelopeActivityId
    },
    serviceEntryVisible () {
      return !!this.systemConfig.serviceAction
    },
    keys () {
      const keys = []
      if (this.serviceEntryVisible) {
        keys.push('service')
      }
      if (this.envelopeEntryVisible) {
        keys.push('envelope')
      }
      if (this.systemConfig.openAccountConsultingQQ) {
        keys.push('qq')
      }
      if (this.systemConfig.contactPhoneNumber) {
        keys.push('phone')
      }
      if (this.systemConfig.appDownloadUrl) {
        keys.push('app')
      }

      return keys
    },
    activeKeys () {
      const keys = []
      const customerServiceVisible = this.$route.query.service === 'on'
      const chatRoomVisible = this.$store.state.chatRoom.isShowing
      const envelopeVisible = this.$store.state.campaignEnvelope.visible

      if (envelopeVisible) {
        keys.push('envelope')
      }
      if (customerServiceVisible) {
        keys.push('service')
      }
      if (chatRoomVisible) {
        keys.push('chatroom')
      }
      return keys
    }
  },
  watch: {
    'keys': {
      handler (keys) {
        this.displayItems = filter(this.items, i => keys.includes(i.key))
      },
      immediate: true
    },
    'displayItems': {
      handler () {
        this.initBubble()
      }
    }
  },
  mounted () {
    this.initBubble()
  },
  methods: {
    toggle () {
      this.navVisible = !this.navVisible
    },
    leaveItem (item) {
      let bubble = this.$refs[`bubble-${item.key}`][0]
      bubble.className = bubble.className.replace(/s?\bshow\b/g, '')
      this.initBubble()
      // TODO
    },
    serviceEntryClick () {
      this.systemConfig.serviceAction()
    },
    envelopeEntryClick () {
      this.$store.dispatch('showCampaignEnvelope')
    },
    initBubble () {
      if (!this.displayItems.length) {
        return
      }

      this.displayItems.forEach((item, index) => {
        if (!this.$refs[`ref-${item.key}`]) {
          return
        }
        const trigger = this.$refs[`ref-${item.key}`][0]
        if (trigger) {
          const bubble = trigger.lastChild
          const bubbleOffset = {
            left: `-${bubble.offsetWidth}px`,
            bottom: `${(trigger.offsetHeight - bubble.offsetHeight) / 2}px`
          }
          this.displayItems[index].bubble.offset = bubbleOffset
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/vars.scss';

.column {
  position: fixed;
  display: flex;
  z-index: $z-rightmenu;
  align-items: center;
  flex-wrap: wrap;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: $rightmenu-width;
  &.invisible {
    .wrapper {
      right: -$rightmenu-width;
    }
    .toggle {
      transform: translateX(100%) rotate(-180deg);
    }
  }
}

.toggle {
  cursor: pointer;
  transition: translateX 0.5s, rotate 0.5s;
  background-color: $primary;
  width: 26px;
  height: 26px;
  display: flex;
  justify-content: center;
  text-align: center;
  position: relative;
  right: 0;
  border-radius: 50%;
  transform: translateX(50%) rotate(0deg);
}
.wrapper {
  border-radius: 4px 0 0 4px;
  width: 100%;
  position: relative;
  transition: right 0.5s;
  right: 0;
}

.item {
  position: relative;
  display: block;
  text-align: center;
  box-sizing: border-box;
  width: 100%;
  color: #fff;
  padding: 8px 0;
  cursor: pointer;
  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
    .bubble {
      visibility: visible;
    }
  }
  &.active {
    cursor: default;
    background-color: rgba(0, 0, 0, 0.3);
  }
}
.icon {
  width: 20px;
  height: 20px;
  font-size: 18px;
}

.label {
  text-align: center;
  max-width: 120px;
  line-height: 1.1;
}

.bubble {
  visibility: hidden;
  bottom: 0;
  left: -190px;
  position: absolute;
  cursor: default;
  .box {
    display: inline-block;
    vertical-align: middle;
    box-sizing: border-box;
    padding: 10px;
  }

  &::after {
    position: absolute;
    top: 50%;
    transform: translateY(-50%); // for vertical align center
    content: '';
    display: inline-block;
    box-sizing: border-box;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 0 8px 8px;
    vertical-align: middle;
  }
  &.show {
    visibility: visible;
  }
  .label {
    font-size: 14px;
  }
  .phone, .number {
    font-size: 24px;
    margin: 10px;
    text-align: center;
  }
  .qrcode {
    float: left;
    margin-top: 5px;
  }
}
</style>
