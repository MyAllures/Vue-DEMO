<template>
  <div class="chatroom-body-wrapper skin__chatroom-body" :style="{'padding-top': tryPlayUser ? '' : '40px'}">
    <div class="chatroom-body" ref="view">
      <div v-if="!isRoomExist" class="room-disable">
        <div class="image"></div>
        <div class="text">聊天室暂不开放，推荐你去下注或追号吧！</div>
      </div>
      <ul class="message-group">
        <li
          v-for="(msg, index) in messagesForDisplay"
          :key="index"
          class="message-group-item">
          <div v-if="msg.type==='system'" class="system-message">{{msg.content}}</div>
          <div v-else-if="user.username !== msg.sender.username" :class="['other-message', chatContentType(msg.type)]">
            <div
              :class="['avatar', {enabled: !!user.account_type}]"
              :style="{'background-image': msg.sender.avatar_url?`url('${msg.sender.avatar_url}')`:`url('${defaultAvatar}')`}"
              @click="handleMember(msg.sender)"></div>
            <div class="right">
              <div class="status-bar">
                <span class="nickname">{{msg.sender.nickname}}</span>
                <template v-if="user.followeeList">
                  <el-button
                    mini
                    plain
                    type="primary"
                    v-if="hasFollowed(msg.sender.username)===false"
                    @click="$parent.toggleFollowee({...msg.sender})">关注</el-button>
                  <span class="followed" v-else>已关注</span>
                </template>
              </div>
              <red-envelope
                v-if="msg.type==='red-envelope'"
                :red-envelope-str="msg.content"
                @take-envelope="handleEnvelope"
                @read-envelope="readEnvelope"/>
              <img-wrapper
                class="image"
                v-else-if="msg.type === 'image' || msg.type === 'sticker'"
                :src="msg.content"
                :type="msg.type"
                @imgStart="imgLoadCount++"
                @imgLoad="imgLoadCount--"
                @click.native="expandImage(msg.content)"/>
              <div v-else class="bubble">
                <bet-info
                  :is-self="user.username === msg.sender.username"
                  v-if="msg.type==='betrecord-sharing'"
                  :info="msg.content"></bet-info>
                <div v-else class="text">{{msg.content}}</div>
              </div>
            </div>
          </div>
          <div v-else :class="['self-message', chatContentType(msg.type)]">
            <red-envelope
              v-if="msg.type==='red-envelope'"
              :red-envelope-str="msg.content"
              @take-envelope="handleEnvelope"
              @read-envelope="readEnvelope"/>
            <img-wrapper
              class="image"
              v-else-if="msg.type === 'image' || msg.type === 'sticker'"
              :src="msg.content"
              :type="msg.type"
              @imgStart="imgLoadCount++"
              @imgLoad="imgLoadCount--"
              @click.native="expandImage(msg.content)"/>
            <div v-else class="bubble">
              <bet-info
                :is-self="user.username === msg.sender.username"
                v-if="msg.type==='betrecord-sharing'"
                :info="msg.content"></bet-info>
              <div v-else class="text">{{msg.content}}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="loading&&isRoomExist" class="room-loading">
      <i class="el-icon-loading"></i>加载中
    </div>
    <template v-if="!loading">
      <div class="followee-filter-group" v-if="!tryPlayUser">
        <div :class="['followee-filter filter left', {active: !filter.filter_followee}]" @click="toggleFolloweeOnly(false)">全部</div>
        <div :class="['followee-filter filter right', {active: filter.filter_followee}]" @click="toggleFolloweeOnly(true)">关注</div>
      </div>
      <div v-if="!tryPlayUser" :class="['bet-filter filter', {active: withoutBet}]" @click="gameFilterDialogVisible = true">
        <icon name="filter" scale="1.5"/>游戏筛选
      </div>
    </template>
    <div :class="['to-bottom-btn', {visible: isToBottomBtnVisible}]" @click="toBottom"></div>
    <red-envelope-status-dialog :visible.sync="takingRedEnvelopeDialogVisible" :envelope="takenRedEnvelope" @read-envelope="readEnvelope"/>
    <red-envelope-detail-dialog :visible.sync="readRedEnvelopeDialogVisible" :id="readEnvelopeId"/>
    <game-filter-dialog :visible.sync="gameFilterDialogVisible"/>
    <ImageLightBox :src="imageExpand.src" :show.sync="imageExpand.visible" />
  </div>
</template>

<script>
import BetInfo from './BetInfo'
import { mapState } from 'vuex'
import throttle from 'lodash/throttle'
import ImgWrapper from './ImgWrapper'
import RedEnvelope from '@/components/chatroom/RedEnvelope'
import RedEnvelopeStatusDialog from '@/components/chatroom/RedEnvelopeStatusDialog'
import RedEnvelopeDetailDialog from '@/components/chatroom/RedEnvelopeDetailDialog'
import GameFilterDialog from '@/components/chatroom/GameFilterDialog'
import ImageLightBox from '@/components/ImageLightBox'
import { eagle } from '@/api'

import '@/components/icon/filter'

export default {
  name: 'ChatroomBody',
  components: {
    BetInfo,
    ImgWrapper,
    RedEnvelope,
    RedEnvelopeStatusDialog,
    RedEnvelopeDetailDialog,
    GameFilterDialog,
    ImageLightBox
  },
  data () {
    return {
      notNeedScroll: false,
      defaultAvatar: require('../../assets/avatar.png'),
      isHelperVisible: true,
      isToBottomBtnVisible: false,
      imgLoadCount: 0,
      takingRedEnvelopeDialogVisible: false,
      selectedMember: {},
      takenRedEnvelope: {},
      readRedEnvelopeDialogVisible: false,
      gameFilterDialogVisible: false,
      readEnvelopeId: '',
      banLoading: false,
      followeeOnly: false,
      withoutBet: false,
      imageExpand: {
        visible: false,
        src: ''
      }
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('chatroom', {
      messages: state => state.messages,
      isManager: state => state.isManager,
      ws: state => state.ws,
      loading: state => state.loading,
      isRoomExist: state => state.isRoomExist,
      filter: state => state.filter
    }),
    messagesForDisplay () {
      let result = this.messages
      let follweeFilter = this.filter.filter_followee
      if (follweeFilter && this.user.followeeList) {
        const hash = {}
        this.user.followeeList.forEach(followee => {
          hash[followee.username] = true
        })
        result = result.filter(msg => !!msg.sender && !!msg.sender.username && hash[msg.sender.username])
      }
      let gameSettingFilter = this.filter.game_settings
      if (gameSettingFilter) {
        result = result.filter(msg => {
          if (msg.type === 'betrecord-sharing' && !gameSettingFilter[msg.content.game_code]) {
            return false
          }
          return true
        })
      }
      if (this.withoutBet) {
        result = result.filter(msg => msg.type !== 'betrecord-sharing')
      }
      return result
    },
    tryPlayUser () {
      return !this.user.account_type
    }
  },
  watch: {
    'messagesForDisplay.length': function (newCount, oldCount) {
      if (newCount === 0) {
        return
      }
      this.notNeedScroll = false
      let view = this.$refs.view
      if (oldCount === 0) { // 初始
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else if ( // 1. user正在閱讀之前訊息 2. 是否為自己發的訊息
        view.scrollTop + view.clientHeight + 100 > view.scrollHeight ||
        (this.messagesForDisplay[newCount - 1].sender && this.messagesForDisplay[newCount - 1].sender.username === this.user.username)) {
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else {
        this.notNeedScroll = true
      }
    },
    imgLoadCount: function (count) {
      if (count === 0) {
        if (!this.notNeedScroll) {
          this.$nextTick(() => {
            const view = this.$refs.view
            view.scrollTop = view.scrollHeight
          })
        }
      }
    }
  },
  mounted () {
    this.notNeedScroll = false
    const view = this.$refs.view
    this.$nextTick(() => {
      view.scrollTop = view.scrollHeight
    })
    view.addEventListener('scroll', this.showToBottomBtn)
  },
  methods: {
    toBottom () {
      const view = this.$refs.view
      if (view) {
        view.scrollTop = view.scrollHeight
      }
    },
    chatContentType (type) {
      switch (type) {
        case 'betrecord-sharing':
          return 'bet-info'
        case 'image':
          return 'image'
        default:
          return 'text'
      }
    },
    showToBottomBtn: throttle(function () {
      const view = this.$refs.view
      if (view.scrollTop + view.clientHeight + 60 < view.scrollHeight) {
        this.isToBottomBtnVisible = true
      } else {
        this.isToBottomBtnVisible = false
      }
    }, 500),
    expandImage (src) {
      this.imageExpand.src = src
      this.imageExpand.visible = true
    },
    handleMember (member) {
      if (!this.user.account_type) {
        return
      }
      this.$emit('select-member', member)
    },
    handleEnvelope (data) {
      this.takenRedEnvelope = data
      this.takingRedEnvelopeDialogVisible = true
    },
    readEnvelope (id) {
      this.readEnvelopeId = id
      this.readRedEnvelopeDialogVisible = true
    },
    toggleFolloweeOnly (status) {
      this.$store.dispatch('chatroom/updateFilter', status)
      let setting = {filter_followee: status}
      this.$store.dispatch('chatroom/updateFilter', setting)
      eagle.updateChatRoomUserInfo(this.user.username, setting).then(res => {
      }).catch(() => {})
    },
    hasFollowed (username) {
      if (!this.user.followeeList) {
        return false
      }
      return this.user.followeeList.some((followee) => followee.username === username)
    }
  },
  beforeDestroy () {
    this.$refs.view.removeEventListener('scroll', this.showToBottomBtn)
  }
}
</script>

<style lang="scss" scoped>
@import '@/style/vars.scss';
.chatroom-body-wrapper {
  position: relative;
  height: calc(100% - 150px);
  flex-direction: column;
  box-sizing: border-box;
}

.room-loading {
  position: absolute;
  top: 0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  color: #999;
  text-align: center;
  .weui-loading {
    height: 30px;
    width: 30px;
  }
}

.chatroom-body {
  box-sizing: border-box;
  position: relative;
  padding: 0 12px 10px 12px;
  background: #eee;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  .room-disable {
    padding-top: 20px;
    .image {
      height: 200px;
      background: url('../../assets/chatroom/room_disabled.png') no-repeat center;
      background-size: contain;
    }
    .text {
      font-size: 14px;
      color: #666;
      text-align: center;
    }
  }
  .message-group {
    padding-bottom: 40px;
    .message-group-item {
      display: flex;
      margin-bottom: 10px;
      .system-message {
        display: inline-block;
        margin: 0 auto;
        padding: 0 10px;
        border-radius: 10px;
        font-size: 12px;
        color: #999;
        background: #e0e0e0;
        text-align: center;
      }

      .other-message,
      .self-message {
        &.text {
          font-size: 14px;
          .bubble {
            display: inline-block;
            .text {
              word-wrap: break-word;
            }
          }
        }
      }
      .bubble {
        box-sizing: border-box;
        position: relative;
        border-radius: 10px;
        padding: 5px 10px;
        max-width: 100%;
      }
      .image {
        cursor: pointer;
      }
      .other-message {
        display: flex;
        color: #333;
        .avatar {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          margin-right: 5px;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          &.enabled{
            cursor: pointer;
          }
        }
        .status-bar {
          padding-bottom: 5px;
          /deep/ .el-button {
            height: 20px;
            width: 45px;
            padding: 0;
            line-height: 20px;
            font-size: 12px;
            background: #fff;
          }
          .followed {
            color: #999;
            font-size: 12px;
          }
        }
        .nickname {
          font-size: 12px;
        }
        .bubble {
          border-top-left-radius: 0;
        }
        &.text {
          max-width: 90%;
          .right {
            width: calc(100% - 36px);
          }
        }
        &.text,
        &.bet-info {
          .bubble {
            background: #fff;
          }
        }
        .image {
          border-radius: 10px;
          border-top-left-radius: 0;
        }
        .sticker {
          width: 120px;
          height: 120px;
        }
      }
      .self-message {
        margin-left: auto;
        .bubble {
          border-top-right-radius: 0;
        }
        &.text {
          max-width: calc(90% - 36px);
        }
        &.text,
        &.bet-info {
          .bubble {
            background: $azul;
            color: #fff;
          }
        }
        .image {
          border-radius: 10px;
          border-top-right-radius: 0;
        }
      }
    }
  }
}
.filter {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px solid;
  color: #999;
  background: #fff;
  border-color: #ddd;
  cursor: pointer;
}
.followee-filter-group {
  position: absolute;
  top: 8px;
  left: 10px;
  display: flex;
}
.followee-filter {
  width: 55px;
  height: 25px;
  &.left {
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &.right {
    border-left: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &.active {
    color: #fff;
  }
}
.bet-filter {
  position: absolute;
  top: 6px;
  right: 15px;
  height: 30px;
  width: 90px;
  &.active {
    color: #fff;
  }
}

.to-bottom-btn {
  box-sizing: border-box;
  position: absolute;
  right: 10px;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  background: url("../../assets/to_bottom.svg") no-repeat center;
  background-color: #fff;
  font-size: 12px;
  transition-duration: 0.2s;
  opacity: 0;
  visibility: hidden;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  &.visible {
    opacity: 1;
    visibility: visible;
  }
}
</style>
