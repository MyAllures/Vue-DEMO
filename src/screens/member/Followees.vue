<template>
  <section>
    <div class="title">我的关注</div>
    <div class="m-b-lg">
      允许被他人关注
      <el-switch
        :disabled="user.followable===undefined||switchLoading"
        @input="switchFollowStatus"
        :value="user.followable"
        active-color="#13ce66"
        inactive-color="#ddd">
      </el-switch>
    </div>
    <template v-if="user.followeeList">
      <ul class="followees" v-if="user.followeeList.length">
        <li :class="['followee', {loading: followeeLoading.includes(index)}]"
          v-for="(followee, index) in user.followeeList" :key="index">
          <img class="avatar" :src="followee.avatar_url || defaultAvatar"/>
          <p class="name">{{followee.nickname || followee.username}}</p>
          <el-button class="btn" type="primary" @click.native="cancelFollow(followee)">
            取消关注
          </el-button>
        </li>
      </ul>
      <div class="no-follow" v-else>
        <div class="icon"></div>
        <div class="text">还没有关注任何会员</div>
        <div class="hint">在聊天室点击头像即可关注会员，快去关注吧！</div>
      </div>
    </template>
  </section>
</template>

<script>
import { eagle } from '@/api'
import { mapState } from 'vuex'

export default {
  name: 'Followees',
  data () {
    const defaultAvatar = require('@/assets/avatar.png')
    return {
      followees: [],
      followeeLoading: [],
      switchLoading: false,
      listReady: false,
      followable: false,
      defaultAvatar
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapState('token', {
      hasToken: state => state.eagle
    })
  },
  watch: {
    hasToken: {
      handler: function (hasToken) {
        if (hasToken && !this.user.followeeList) {
          this.$store.dispatch('fetchChatRoomUserInfo')
        }
      },
      immediate: true
    }
  },
  methods: {
    switchFollowStatus (val) {
      this.switchLoading = true
      eagle.updateChatRoomUserInfo(this.user.username, {
        followable: val
      }).then(() => {
        this.$store.dispatch('setUser', {
          followable: val
        })
      }).catch(() => {

      }).finally(() => {
        this.switchLoading = false
      })
    },
    cancelFollow (followee) {
      if (this.followeeLoading.includes(followee.username)) {
        return
      }
      this.followeeLoading.push(followee.username)
      this.$store.dispatch('toggleFollowee', followee).then(res => {
        this.$message({
          message: res.messages[0],
          type: 'success'
        })
        this.followeeLoading.splice(this.followeeLoading.indexOf(followee.username), 1)
      }).catch(() => {

      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.followee {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 130px;
  height: 180px;
  padding: 5px;
  border: solid 1px #eeeeee;
  margin-right: 10px;
  margin-bottom: 10px;
  text-align: center;
  transition: .3s all ease-in-out;
  &.loading {
    opacity: .7;
  }
}

.avatar {
  display: inline-block;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  margin-bottom: 5px;
  margin-top: 10px;
}

.name {
  height: 40px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-break: break-all;
  overflow: hidden;
  margin-bottom: 10px;
}

.no-follow {
  text-align: center;
  .icon{
    height: 200px;
    background: url('../../assets/no_follow.png')  no-repeat center;
    background-size: contain;
  }
  .text {
    font-size: 16px;
    color: #333;
  }
  .hint {
    font-size: 14px;
    color: #666;
  }
}
</style>
