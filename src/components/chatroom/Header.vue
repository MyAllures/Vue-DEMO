<template>
  <div class="chatroom-header skin__chatroom-header">
    <div class="room-name">{{roomName}}</div>
    <div v-if="isManager" :class="['control', {active: banDialogVisible, disabled: noPermission}]" @click="handleBan">
      <icon name="block" scale="1.1"/>
      禁言管理
    </div>
    <div v-show="!tryPlayUser" :class="['control', {active: isEditing, disabled: !user.account_type}]" v-popover:editavatar-popover @click="handleEditAvatar">
      <icon name="avatar" scale="1.1"/>
      编辑头像
    </div>
    <el-popover :popper-class="'avatar-popover'"
      ref="editavatar-popover"
      placement="bottom-start"
      :offset="100"
      :width="240"
      @hide="isEditing = false;nicknameChanging = false"
      trigger="click">
      <div class="text-center avatar-editor">
        <p class="tip">
          {{ !user.avatar ? '您尚未设置头像，请点击上传': ''}}
        </p>
        <div class="text-center">
          <div class="avatar" :style="{ backgroundImage: `url(${user.avatar || defaultAvatar}`} ">
            <el-upload
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload">
              <div class="action">
              <span class="icon" v-if="user.avatar">
                <img class="changing" src="../../assets/icon_changeavatar.png" alt="icon">
              </span>
              <span class="icon" v-else>
                <b class="new">+</b>
              </span>
            </div>
            </el-upload>
          </div>
        </div>
        <div class="display-name clickable">
          <div v-if="nicknameChanging">
            <input class="nickname-input"
                maxlength="10"
                v-model.trim="nickname"
                :placeholder="user.nickname"
                @blur="submitNickName"
                @keypress="preventNickname"
                type="text"/>
            <span class="edit-icon el-icon-circle-check-outline"></span>
          </div>
          <div @click="nicknameChanging = true" v-else>
            <span class="nickname">
              {{!user.account_type ? '试玩会员' : (user.nickname || user.username)}}
            </span>
            <span class="edit-icon el-icon-edit-outline"></span>
          </div>
        </div>
      </div>
    </el-popover>
    <el-dialog
      title="禁言管理"
      :visible.sync="banDialogVisible"
      width="650px"
      custom-class="ban-dialog-content"
      center
      append-to-body>
      <el-table class="table" v-loading="unbanLoading" :data="bannedList" stripe>
        <el-table-column
          label="会员名"
          prop="username">
        </el-table-column>
        <el-table-column
          label="昵称"
          prop="nickname">
        </el-table-column>
        <el-table-column
          label="禁言时间">
          <template slot-scope="scope">
            <div>{{ `${scope.row.ban_duration}分钟`}}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="剩余时间">
          <template slot-scope="scope">
            <div>{{ `${scope.row.ban_remaining_time}分钟`}}</div>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <a class="unban" @click="unbanMember(scope.row.username)">解除禁言</a>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import '@/components/icon/avatar'
import '@/components/icon/block'
import { urls, updateUser } from '@/api'
import { mapState } from 'vuex'
import { msgFormatter } from '@/utils'
export default {
  name: 'ChatroomHeader',
  data () {
    return {
      defaultAvatar: require('../../assets/avatar.png'),
      uploadUrl: urls.user,
      nicknameChanging: false,
      isEditing: false,
      banDialogVisible: false,
      bannedList: [],
      unbanLoading: false,
      nickname: '',
      submitting: false
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('chatroom', {
      permission: state => state.permission,
      ws: state => state.ws,
      isManager: state => state.isManager,
      roomName: state => state.roomName
    }),
    noPermission () {
      return !this.permission || !this.permission.eligible
    },
    tryPlayUser () {
      return !this.user.account_type
    }
  },
  watch: {
    'banDialogVisible': function (visible) {
      if (visible) {
        this.ws.fetchBannedList().then(res => {
          this.bannedList = res
        }).catch(() => { })
      }
    }
  },
  created () {
    this.nickname = this.user.nickname || ''
  },
  methods: {
    handleBan () {
      if (this.noPermission) {
        return
      }
      this.banDialogVisible = true
    },
    handleEditAvatar () {
      if (this.noPermission) {
        return
      }
      this.isEditing = !this.isEditing
    },
    handleAvatarSuccess (res, file) {
      this.$store.dispatch('setUser', {
        avatar: URL.createObjectURL(file.raw)
      })
    },
    beforeAvatarUpload (file) {
      let formData = new FormData()
      formData.append('avatar', file)
      updateUser(this.user.id, formData).then((data) => {
        this.$store.dispatch('setUser', data)
        this.messages = this.messages.filter((item) => item.type !== -3)
      }, errorMsg => {
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      })
    },
    preventNickname (evt) {
      let reg = /^[a-zA-Z0-9]$/
      if (!reg.test(evt.key)) {
        evt.preventDefault()
      }
    },
    submitNickName () {
      if (this.submitting) {
        return
      }
      if (this.nickname === this.user.nickname) {
        this.nicknameChanging = false
        return
      }
      updateUser(this.user.id, { nickname: this.nickname }).then((data) => {
        this.$store.dispatch('setUser', data)
        this.nicknameChanging = false
      }).catch(errorMsg => {
        this.nicknameChanging = false
        this.nickname = this.user.nickname
        this.$message({
          showClose: true,
          message: msgFormatter(errorMsg),
          type: 'error'
        })
      }).finally(() => {
        this.submitting = false
      })
    },
    unbanMember (username) {
      if (this.unbanLoading) {
        return
      }
      this.unbanLoading = true
      this.ws.unbanMember(username).then(res => {
        this.$message({
          message: res.status,
          type: 'success'
        })
        return this.ws.fetchBannedList()
      }).then(res => {
        this.bannedList = res
      }).catch(() => {

      }).finally(() => {
        this.unbanLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../style/vars.scss';
.chatroom-header {
  flex: 0 0 auto;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #f5f5f5;
  font-size: 12px;
  padding: 0 10px;
}
.title {
  color: #333;
  font-size: 14px;
  margin-right: auto;
}
.control {
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 10px;
  color: #999;
  outline: none;
  cursor: pointer;
  &.disabled {
    color: #ccc;
    cursor: not-allowed;
  }
}
.room-name {
  color: #666;
  letter-spacing: 0.5px;
  font-size: 14px;
  margin-right: auto;
}

.avatar-editor {
  padding-top: 15px;
  .tip {
    font-size: 12px;
    color: #999;
    min-height: 15px;
  }
  .avatar {
    position: relative;
    display: inline-block;
    width: 100px;
    height: 100px;
    margin-top: 15px;
    border-radius: 15px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    border: 1px solid #ddd;
    .action {
      position: absolute;
      right: -10px;
      bottom: -10px;
      .icon {
        display: inline-block;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        text-align: center;
        color: #fff;
        line-height: 40px;
        .changing {
          vertical-align: middle;
        }
        .new {
          display: inline-block;
          margin-top: -5px;
          font-size: 30px;
          vertical-align: middle;
        }
      }
      &:hover {
        border-radius: 50%;
      }
    }
  }

  .display-name {
    position: relative;
    display: inline-block;
    margin-top: 35px;
    margin-bottom: 30px;
    .nickname-input {
      width: 120px;
      font-size: 16px;
      border: none;
      outline: none;
      background-color: transparent;
      &::placeholder {
        color: #ccc;
      }
    }
    .nickname,
    .edit-icon {
      color: grey;
    }
    .nickname {
      display: inline-block;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
      font-size: 16px;
    }
    .edit-icon {
      font-size: 20px;
      vertical-align: middle;
      &:hover {
        color: opacity(0.9);
      }
    }
  }
}

.unban {
  color: $azul;
  cursor: pointer;
}
</style>
