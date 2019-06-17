<template>
  <div>
    <div class="title">我的好友推荐名单</div>
    <div class="block-wrap" v-loading="isLoading">
      <div class="empty" v-if="!list.length">
        <img src="@/assets/red-envelope-v2/list-empty.png" />
        <p class="msg-1">还没有推荐任何好友</p>
        <p class="msg-2">快使用专属的推荐链结来推荐好友吧</p>
        <el-button type="primary" @click="actDialogType = 'referral'">我的推荐链结</el-button>
      </div>
      <div class="block" v-for="(data, i) in list" v-else>
        <div class="avatar">
          <img :src="data.avatar_url" :alt="data.member" v-if="data.avatar_url" />
          <img src="@/assets/red-envelope-v2/avatar-default.png" v-else />
        </div>
        <div class="username">{{ data.member }}</div>
        <div class="status">
          <img src="@/assets/red-envelope-v2/success.svg" v-if="data.receivable" />
          <span v-else>已注册</span>
        </div>
        <div class="receive">
          <el-button disabled v-if="!data.receivable">尚未 </el-button>
          <el-button type="info" disabled v-else-if="data.envelope_count === 0">领取完</el-button>
          <el-button type="primary" @click="openRE(data.id, i)" :loading="reLoading && currentIdx === i" :disabled="reLoading" v-else>拆 {{data.envelope_count}} 个红包</el-button>
        </div>
      </div>
    </div>
    <RedEnvDialog :data="redEnvData" :remain="list[currentIdx] && list[currentIdx].envelope_count" :show="showReDialog" @next="openRE" @hide="showReDialog = false" />
    <RedEnvPromotion :type="actDialogType" defaultContent="referral" @hide="actDialogType = ''" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RedEnvPromotion from '@/components/actV2/RedEnvPromotion'
import RedEnvDialog from '@/components/actV2/RedEnvDialog'
import {
  fetchActRefList,
  openActRe
} from '@/api'

export default {
  name: 'referrals',
  components: {
    RedEnvPromotion,
    RedEnvDialog
  },
  data: () => ({
    isLoading: true,
    reLoading: false,
    redEnvData: {},
    showReDialog: false,
    currentId: -1,
    currentIdx: -1,
    actDialogType: ''
  }),
  mounted () {
    this.fetchActRefList()
  },
  methods: {
    fetchActRefList () {
      fetchActRefList().then(response => {
        this.$store.dispatch('actv2/setRefList', response)
        this.isLoading = false
      })
    },
    openRE (id = -1, i = -1) {
      this.currentId = id > -1 ? id : this.currentId
      this.currentIdx = i > -1 ? i : this.currentIdx

      this.reLoading = true
      this.showReDialog = false

      openActRe('referral', this.currentId).then(response => {
        this.redEnvData = response
        this.showReDialog = true
        this.reLoading = false
      })
    }
  },
  computed: {
    ...mapState('actv2', {
      list: state => state.referral.list
    })
  }
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 10px 0 30px;
}
.block-wrap {
  display: flex;
  flex-wrap: wrap;
}
.empty {
  flex: 1;
  text-align: center;
  margin: 30px 0 50px;
  line-height: 26px;

  .msg-1 {
    font-size: 16px;
    color: #333;
  }
  .msg-2 {
    color: #666;
  }
  button {
    width: 220px;
    margin-top: 10px;
  }
}
.block {
  width: 150px;
  border: 1px solid #EEE;
  margin: 0 10px 10px 0;
  padding: 20px 10px;
  text-align: center;
  box-sizing: border-box;
}
.avatar {
  width: 60px;
  height: 60px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }
}
.status {
  line-height: 1;
  margin: 2px 0 15px;

  span {
    color: #999;
    line-height: 22px;
  }
}
</style>
