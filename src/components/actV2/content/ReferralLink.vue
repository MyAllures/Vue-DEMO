<template>
  <div class="content flex">
    <div class="left">
      <div class="section">
        <div class="title">推荐链结使用说明</div>
        <div class="section-content">
            <span>* 使用二维码或推荐链结邀请好友注册<br /></span>
            <span v-if="act.check_referral_deposit.enabled">* 好友需 金额达到 {{ act.check_referral_deposit.required_deposit || 0 }} 元以上<br /></span>
            <span>* 可在我的推荐中查看，了解推荐人数</span>
        </div>
      </div>
      <div class="section">
        <div class="title">我的推荐链结</div>
        <div class="link">
          <input type="text" :value="refLink" @click="$event.target.select()" readonly :disabled="codeLoading" />
          <button :data-clipboard-text="refLink" :disabled="codeLoading">复制</button>
        </div>
      </div>
    </div>
    <div class="section right">
      <div class="title">我的推荐二维码</div>
      <div class="qrcode">
        <i class="el-icon-loading" v-if="codeLoading"></i>
        <qrcode ref="qr" :value="refLink" :options="{ width: 165, margin: 2 }" v-else />
      </div>
    </div>
  </div>
</template>

<script>
import VueQrcode from '@chenfengyuan/vue-qrcode'
import ClipboardJS from 'clipboard'
import { fetchActRefCode } from '@/api'

export default {
  name: 'ReferralLink',
  props: {
    act: Object
  },
  components: {
    qrcode: VueQrcode
  },
  data: () => ({
    clipboard: null,
    codeLoading: true,
    code: ''
  }),
  mounted () {
    this.getRefCode()
    this.setClipboard()
  },
  methods: {
    getRefCode () {
      fetchActRefCode().then(res => {
        this.code = res.referral_code
        this.codeLoading = false
      })
    },
    setClipboard () {
      this.clipboard = new ClipboardJS('[data-clipboard-text]')
      this.clipboard.on('success', e => {
        this.$message.success('复制成功')
        e.trigger.focus()
      })
    }
  },
  computed: {
    refLink () {
      const key = 'f'
      return this.codeLoading ? 'Loading...' : `${location.protocol}//${location.host}${location.pathname}?${key}=${this.code}`
    }
  },
  beforeDestroy () {
    this.clipboard && this.clipboard.destroy()
  }
}
</script>

<style lang="scss" scoped>
.flex {
  display: flex;

  .left {
    flex: 1;
    margin-right: 10px;
  }
  .right {
    flex: 0 0 165px;
  }
}
.title {
  text-align: left;
  color: #6d6452;
  margin-bottom: 5px;
}
.qrcode {
  margin: 0 auto 6px;
  width: 165px;
  height: 165px;
  background: #FFF;
  display: flex;
  justify-content: center;
  align-items: center;

  canvas {
    display: block;
  }
}
.link {
  display: flex;

  > * {
    border: 1px solid #ddd;
    background: #FFF;

    &:focus {
      position: relative;
    }
  }
  input {
    flex: 1;
    color: #999;
    padding: 10px;
    font-size: 14px;
    border-radius: 2px 0 0 2px;
  }
  button {
    flex: 0 0 70px;
    margin-left: -1px;
    font-size: 14px;
    color: #df4238;
    border-radius: 0 2px 2px 0;
    outline: none;
    cursor: pointer;
  }
}
</style>
