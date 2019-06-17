<template>
  <el-dialog
    :visible="visible"
    @update:visible="updateDialogVisible"
    width="420px"
    custom-class="red-envelope-detail-dialog"
    center
    @closed="reset"
    append-to-body>
    <div class="header">
      <div class="info-panel">
        <div class="name">{{envelope.sender}}的红包</div>
        <div class="desc">{{envelope.content}}</div>
        <div v-if="envelope.status==='acquired'" class="amount">{{myAmount|currency('￥')}}</div>
      </div>
      <div class="ellipse"></div>
    </div>
    <div class="receiver-title">{{envelope.receiver_list.length}}人已抢到</div>
    <div class="receiver-area">
      <div class="list">
        <div :class="['list-item', receiver.username===user.username?'self':'']" v-for="receiver in envelope.receiver_list" :key="receiver.username">
          <span>{{receiver.nickname}}</span>
          <span>{{receiver.amount|currency('￥')}}</span>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import {fetchRedEnvelopeDetail} from '@/api'
import { mapState } from 'vuex'
export default {
  name: 'RedEnvelopeDetailDialog',
  props: {
    visible: {
      type: Boolean
    },
    id: {
      type: [Number, String]
    }
  },
  data () {
    return {
      envelope: {
        sender: '',
        content: '',
        amount: 0,
        status: '',
        receiver_list: []
      }
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    myAmount () {
      const data = this.envelope.receiver_list.find(list => list.username === this.user.username)
      return data ? data.amount : 0
    }
  },
  watch: {
    visible (visible) {
      if (visible) {
        fetchRedEnvelopeDetail(this.id).then(res => {
          this.envelope = res
        })
      }
    }
  },
  methods: {
    reset () {
      this.envelope = {
        sender: '',
        content: '',
        amount: 0,
        status: '',
        receiver_list: []
      }
    },
    updateDialogVisible (visible) {
      this.$emit('update:visible', visible)
    }
  }
}
</script>
<style lang="scss" scoped>
.el-dialog__wrapper /deep/ .el-dialog.red-envelope-detail-dialog {
   .el-dialog__header {
    display: none;
  }
   .el-dialog__body {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 0 0 20px 0;
    height: 550px;
  }
}
.header {
  flex: 0 0 auto;
  color: #fdebc5;
  line-height: 1.6;
  .info-panel {
    position: relative;
    text-align: center;
    background: #d23f34;
    padding-top: 10px;
    z-index: 1;
    .name {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .desc {
      font-size: 12px;
    }
    .amount {
      padding-top: 5px;
      font-size: 32px;
    }
  }
  .ellipse {
      height: 60px;
      width: 100%;
      background: #d23f34;
      clip-path: ellipse(50% 40% at 50% 50%);
      margin-top: -30px;
    }
}
.receiver-title {
  flex: 0 0 auto;
  font-size: 13px;
  color: #999;
  height: 50px;
  line-height: 50px;
  text-align: center;
}
.receiver-area {
  flex: 1 1 auto;
  overflow-y: auto;
  .list {
    font-size: 14px;
    color: #333;
    width: 260px;
    margin: 0 auto;
  }
  .list-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    &.self {
      color: #d0021b;
    }
  }
}
</style>
