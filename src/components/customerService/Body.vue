<template>
  <div class="message-body">
    <div class="messages-container" ref="serviceChatBox" @wheel="handleScroll">
      <ul class="msgs">
        <li class="msg" v-if="hasMoreHistory && showLoadHistoryLink">
          <span class="tip history-tip">
            <i class="el-icon-loading" v-if="loadingHistory"></i>
            <a @click="fetchHistoryMessage" v-else>上滚阅读过往聊天记录 ↑</a>
          </span>
        </li>
        <li class="msg" v-if="tempDateTag">
          <div class="msg-badge">
            <div class="content badge">
              <p>{{tempDateTag}}</p>
            </div>
          </div>
        </li>
        <li :ref="`message-${msgIndex}`" class="msg" v-for="(msg, msgIndex) in sortedMessages" :key="msgIndex">
          <div :class="msg.wrapperClassList" v-if="msg">
            <div :class="['content', ...msg.contentClassList]">
              <template v-if="msg.isChatMsg">
                <template>
                  <img v-if="msg.user.avatar_url" class="avatar" :src="msg.user.avatar_url" alt="a">
                  <i class="no-avatar" v-else>{{msg.user.username[0].toUpperCase()}}</i>
                </template>
                <div class="user-wrapper">
                  <p class="username">客服 {{msg.user.nickname || msg.user.username}}</p>
                  <div class="msg-wrapper" v-if="msg.text">
                    <span class="bubble" v-if="msg.type === MSG_TYPE.normal">
                      {{msg.text}}
                    </span>
                    <a class="image bubble" :href="msg.text" target="_blank" v-if="msg.type === MSG_TYPE.image">
                      <img :src="msg.text" alt="img" @load="handleScrollTop" />
                    </a>
                    <img class="sticker" v-if="msg.type === MSG_TYPE.sticker" :src="msg.text" alt="sticker" @load="handleScrollTop" />
                    <span class="date">{{$moment(msg.created_at).format('HH:mm:ss')}}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="msg.type === MSG_TYPE.review">
                <p class="review-box">
                  <span class="rating">您为这次对话给出了<span :style="{ color: getRatingColor(msg.rating) }">【{{ getRatingDesc(msg.rating) }}】</span></span>
                  <span class="comment" v-if="msg.text">{{ msg.text }}</span>
                </p>
                <a class="clear" href="#" @click.prevent="clearReview(msg.id)" v-if="isLastReview(msgIndex)"><img src="../../assets/cs/icon-review-remove.svg" />清除</a>
              </template>
              <template v-else>
                <p v-html="msg.text"></p>
              </template>
            </div>
          </div>
        </li>
        <li ref="scrollTrigger" class="scroll-trigger"></li>
      </ul>
    </div>
    <div class="to-bottom" v-if="showScrollToBottom" @click="scrollToBottom">
      <img src="@/assets/icon_arrow.svg" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { concat, map, takeRight } from 'lodash'
import { MSG_TYPE, MSG_CAT, RATINGS } from '@/utils/customerService'
import { deleteServiceReview } from '@/api'

export default {
  data () {
    return {
      MSG_TYPE,
      MSG_CAT,
      RATINGS,
      defaultHistoryNum: 30,
      showFullHistory: false,
      showLoadHistoryLink: true,
      showScrollToBottom: false,
      loadingHistory: false
    }
  },
  methods: {
    handleScroll (e) {
      const chatBox = this.$refs.serviceChatBox
      const variation = parseInt(e.deltaY) // > 0: scroll down, < 0: scroll top
      if (variation < 0 && chatBox.scrollTop === 0) {
        this.fetchHistoryMessage()
        e.preventDefault() // prevent scroll parent
      } else if (variation > 0 && chatBox.scrollTop + chatBox.clientHeight === chatBox.scrollHeight) {
        e.preventDefault()
      }
      this.showScrollToBottom = chatBox.scrollTop + chatBox.clientHeight < chatBox.scrollHeight - chatBox.clientHeight
    },
    handleScrollTop () {
      this.$nextTick(() => {
        if (!this.showScrollToBottom) {
          this.scrollToBottom()
        }
      })
    },
    scrollToBottom () {
      this.$refs.scrollTrigger && this.$refs.scrollTrigger.scrollIntoView()
      this.showScrollToBottom = false
    },
    fetchHistoryMessage () {
      if (this.loadingHistory || !this.hasMoreHistory) {
        return
      }
      this.loadingHistory = true
      setTimeout(() => {
        this.loadingHistory = false
        this.showLoadHistoryLink = false
        this.showFullHistory = true
      }, 500)
    },
    catHasMessages (cat) {
      return this.received[cat] && this.received[cat].length > 0
    },
    getRatingDesc (rating) {
      const item = RATINGS.find(r => r.value === rating)
      return item.desc
    },
    getRatingColor (rating) {
      const item = RATINGS.find(r => r.value === rating)
      return item.color
    },
    isLastReview (index) {
      const last = this.sortedMessages.length - 1 - this.sortedMessages.slice().reverse().findIndex(msg => msg.type === MSG_TYPE.review || msg.type === MSG_TYPE.reviewCancel)
      return last === index
    },
    clearReview (id) {
      deleteServiceReview(id).then(() => {
        this.$store.dispatch('customerService/deleteReview', id)
      })
    }
  },
  watch: {
    '$route.query.service' (visible) {
      if (visible === 'on') {
        this.handleScrollTop()
      }
    },
    messageCollection () {
      this.handleScrollTop()
    }
  },
  computed: {
    ...mapState('customerService', {
      received: state => state.received
    }),
    historyMessage () {
      return this.showFullHistory ? this.received[MSG_CAT.history] : takeRight(this.received[MSG_CAT.history], this.defaultHistoryNum)
    },
    hasMoreHistory () {
      return (this.isHideHistory && this.catHasMessages(MSG_CAT.history)) || (!this.isHideHistory && this.received[MSG_CAT.history].length > this.defaultHistoryNum)
    },
    isHideHistory () {
      return this.catHasMessages(MSG_CAT.offline) && !this.showFullHistory
    },
    offlineMessage () {
      const msg = this.received[MSG_CAT.offline].slice(0)
      if (!this.isHideHistory && msg[0] && this.catHasMessages(MSG_CAT.history)) {
        const hLastDate = this.$moment(this.historyMessage[this.historyMessage.length - 1].created_at).format('YYYY-MM-DD')
        const oFirstDate = msg[0].text === '今天' ? this.$moment().format('YYYY-MM-DD') : msg[0].text
        if (hLastDate === oFirstDate) {
          msg.shift()
        }
      }
      return msg
    },
    tempDateTag () {
      if (this.catHasMessages(MSG_CAT.offline) || !this.catHasMessages(MSG_CAT.history) || this.historyMessage[0].date_tag) {
        return false
      }
      if ((this.hasMoreHistory && this.showLoadHistoryLink) || !this.hasMoreHistory) {
        const date = this.$moment(this.historyMessage[0].created_at).format('YYYY-MM-DD')
        const today = this.$moment().format('YYYY-MM-DD')

        return date === today ? '今天' : date
      }
      return false
    },
    messageCollection () {
      return concat(
        this.isHideHistory ? [] : this.historyMessage,
        this.received[MSG_CAT.welcome],
        this.offlineMessage,
        this.received[MSG_CAT.common],
        this.received[MSG_CAT.error]
      )
    },
    sortedMessages () {
      return map(this.messageCollection, msg => {
        let wrapperClassList = []
        let contentClassList = []
        let isChatMsg = false
        switch (msg.type) {
          case MSG_TYPE.welcome_message:
          case MSG_TYPE.error:
          case MSG_TYPE.review:
          case MSG_TYPE.reviewThank:
            wrapperClassList = ['msg-box']
            contentClassList = ['box', msg.cat]
            if (msg.type === MSG_TYPE.review) {
              contentClassList.push('review')
            }
            break
          case MSG_TYPE.datetag:
          case MSG_TYPE.reviewCancel:
          case MSG_TYPE.system:
            wrapperClassList = ['msg-badge']
            contentClassList = ['badge']
            if (msg.text === this.$moment().format('YYYY-MM-DD')) {
              msg.text = '今天'
            }
            break
          case MSG_TYPE.image:
          case MSG_TYPE.sticker:
          case MSG_TYPE.normal:
            const className = {
              1: 'normal',
              2: 'image',
              3: 'sticker'
            }
            wrapperClassList = [(msg.user && msg.user.role <= 1) ? 'service-sent' : 'self-sent']
            contentClassList = [className[msg.type]]
            isChatMsg = true
            break
          default:
            console.log(msg, msg.type)
            return
        }
        return {
          ...msg,
          wrapperClassList,
          contentClassList,
          isChatMsg
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.message-body {
  height: 360px;
  border-bottom: solid 1px #e5e5e5;
  position: relative;
  box-sizing: border-box;
}
.messages-container {
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
  background: #fff;
  overflow-y: auto;
  box-sizing: border-box;
}

.msg {
  padding-bottom: 10px;
  padding-top: 10px;

  .tip {
    color: #999;
    font-size: 12px;
    text-align: center;
    display: block;

    a {
      cursor: pointer;
    }
    .el-icon-loading {
      font-size: 14px;
    }
  }
  .history-tip a {
    display: inline-block;
    margin-top: 30px;
  }
  .bubble {
    display: inline-block;
    padding: 5px 10px;
    max-width: 240px;
    font-size: 14px;
    overflow: hidden;
    word-break: break-word;
    box-sizing: border-box;

    &.image,
    &.sticker {
      padding: 0;
    }
    &.image img {
      display: block;
      max-width: 100%;
    }
  }
  .date {
    font-size: 12px;
    color: #999;
    margin: 0 5px;
  }
  .content {
    display: flex;
    align-items: flex-start;
  }
  .msg-wrapper {
    display: flex;
    align-items: flex-end;
  }
  img.sticker {
    display: inline-block;
    height: 120px;
  }
  .review-box {
    width: 100%;

    .rating,
    .comment {
      display: block;
    }
    .rating {
      text-align: center;
    }
    .comment {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
      word-break: break-word;
    }
  }

  .self-sent {
    display: flex;
    justify-content: flex-end;
    .avatar, .no-avatar, .username {
      display: none;
    }
    .bubble {
      order: 2;
      border-radius: 8px 0 8px 8px;
      background-color: #166fd8;
      color: #fff;
    }
    .sticker {
      order: 2;
    }
    .date {
      order: 1;
    }
  }

  .service-sent {
    display: flex;
    justify-content: flex-start;
    .avatar, .no-avatar {
      order: 1;
      width: 36px;
      height: 36px;
      border-radius: 50%;
    }
    .avatar {
      background-color: #ddd;
      margin-right: 5px;
    }
    .no-avatar {
      order: 1;
      line-height: 36px;
      background-color: azure;
      color: #333;
      text-align: center;
      margin-right: 5px;
    }
    .user-wrapper {
      order: 2;
    }
    .username {
      font-size: 14px;
      color: #166fd8;
      margin-bottom: 5px;
    }
    .bubble {
      border-radius: 0px 8px 8px 8px;
      background-color: #f5f5f5;
      color: #333;
    }
  }

  .msg-badge, .msg-box {
    display: flex;
    justify-content: center;
  }
  .badge {
    display: inline-block;
    padding: 1px 10px;
    background-color: #e0e0e0;
    border-radius: 10px;
    font-size: 12px;
    color: #999;
  }
  .box {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 5px 13px;
    text-align: left;
    font-size: 14px;
    color: #333;
    box-sizing: border-box;

    &.welcome {
      line-height: 1.6;
    }
  }
  .review {
    width: 250px;
    position: relative;

    .clear {
      display: block;
      position: absolute;
      right: -43px;
      bottom: 0;
      font-size: 12px;
      color: #b0b0b0;
      line-height: 1;

      img {
        vertical-align: middle;
      }
    }
  }
  .error {
    color: #d0021b;
  }
}

.scroll-trigger {
  height: 0;
  font-size: 0;
}

.to-bottom {
  position: absolute;
  right: 15px;
  bottom: 15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
