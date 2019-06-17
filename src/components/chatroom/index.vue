<template>
  <div class="chatroom-container skin__chatroom">
    <chatroom-header></chatroom-header>
    <chatroom-body @select-member="handleSelectedMember"></chatroom-body>
    <chatroom-footer></chatroom-footer>
    <el-dialog
      title="会员"
      :visible.sync="memberDialogVisible"
      :fullscreen="false"
      width="280px"
      class="follow-dialog"
      custom-class="follow-dialog-content"
      :modal="false"
      @closed="selectedMember = {}"
      center>
      <div
        class="avatar"
        :style="{'background-image': selectedMember.avatar_url?`url('${selectedMember.avatar_url}')`:`url('${defaultAvatar}')`}"></div>
      <div class="nickname">{{selectedMember.nickname}}</div>
      <div slot="footer">
        <div class="buttons single">
          <template v-if="!tryPlayUser">
            <div v-if="!selectedMember.username||!user.followeeList||followLoading" class="loading">
              <i class="el-icon-loading"></i>加载中
            </div>
            <el-button class="btn" v-else-if="!selectedMember.followable" disabled>未开放关注</el-button>
            <el-button class="btn" v-else-if="user.followeeList.find(followee => followee.username === selectedMember.username)" @click.native="toggleFollowee(selectedMember)">取消关注</el-button>
            <el-button class="btn" v-else type="primary" @click.native="toggleFollowee(selectedMember)">关注</el-button>
          </template>
        </div>
        <div v-if="selectedMember.username&&isManager&&selectedMember.bannable" class="buttons">
          <div v-if="banLoading" class="loading">
            <i class="el-icon-loading"></i>加载中
          </div>
          <template v-else>
            <el-button class="btn" :disabled="selectedMember.banned" @click.native="banMember(15)">禁言15分钟</el-button>
            <el-button class="btn" :disabled="selectedMember.banned" @click.native="banMember(30)">禁言30分钟</el-button>
          </template>
        </div>
      </div>
    </el-dialog>
    <div class="follow-modal" v-show="memberDialogVisible"></div>
  </div>
</template>

<script>
import ChatroomHeader from './Header'
import ChatroomBody from './Body'
import ChatroomFooter from './Footer'
import { mapState } from 'vuex'
import { EagleWebSocket } from '@/wsObj/eagle'
import { eagle } from '@/api'
import { getJWTToken } from '@/utils'

export default {
  name: 'Chatroom',
  componentName: 'Chatroom',
  components: {
    ChatroomHeader,
    ChatroomBody,
    ChatroomFooter
  },
  data () {
    return {
      defaultAvatar: require('../../assets/avatar.png'),
      tokenCancelablePromise: null,
      memberDialogVisible: false,
      selectedMember: {},
      followLoading: false,
      banLoading: false
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('chatroom', {
      emojiMap: state => state.emojiMap,
      ws: state => state.ws,
      permission: state => state.permission,
      wsStatus: state => state.status,
      roomList: state => state.roomList,
      isManager: state => state.isManager
    }),
    ...mapState('token', {
      hasToken: state => state.eagle
    }),
    tryPlayUser () {
      return !this.user.account_type
    }
  },
  watch: {
    hasToken: {
      handler: function (hasToken) {
        if (hasToken) {
          if (this.user.account_type) {
            if (!this.user.followeeList) {
              this.$store.dispatch('fetchChatRoomUserInfo')
            }
            if (this.emojiMap === null) {
              this.$store.dispatch('chatroom/initEmoji')
            }
            this.$store.dispatch('chatroom/initFilter')
          }
          let token = getJWTToken('eagle')
          this.$store.dispatch('chatroom/setWs', new EagleWebSocket(token, this.roomList[0]))
        }
      },
      immediate: true
    }
  },
  methods: {
    handleSelectedMember (member) {
      this.memberDialogVisible = true
      eagle.fetchUserDetail(member.username, this.ws.roomId).then((res) => {
        this.selectedMember = { ...member, ...res }
      }).catch(() => {

      })
    },
    banMember (duration) {
      this.banLoading = true
      this.ws.banMember(this.selectedMember.username, duration).then(res => {
        this.selectedMember.banned = true
        this.$message({
          message: res.status,
          type: 'success'
        })
      }).catch(() => {

      }).finally(() => {
        this.banLoading = false
      })
    },
    toggleFollowee (followee) {
      this.followLoading = true
      this.$store.dispatch('toggleFollowee', followee).then(res => {
        this.$message({
          message: res.messages[0],
          type: 'success'
        })
      }).catch(errRes => {
        this.$message({
          message: errRes.data.messages[0],
          type: 'error'
        })
      }).finally(() => {
        this.followLoading = false
      })
    }
  },
  beforeDestroy () {
    if (this.tokenCancelablePromise) {
      // 避免組件銷毀後異步建立連線
      this.tokenCancelablePromise.cancel()
    }
    if (this.ws) {
      this.ws.leaveRoom()
    }
  }
}
</script>

<style lang="scss" scoped>
.chatroom-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.follow-dialog-content {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    margin: 0 auto 10px auto;
  }
  .nickname {
    font-size: 16px;
    text-align: center;
  }
  .loading {
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 18px;
    text-align: center;
    .weui-loading {
      height: 30px;
      width: 30px;
    }
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    &.single {
      justify-content: center;
      padding-bottom: 10px;
    }
    height: 30px;
    .btn {
      width: 90px;
    }
  }
}

.follow-modal {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: .5;
  background: #000;
}
</style>
