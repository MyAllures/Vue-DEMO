<template>
  <el-dialog
    :visible="visible"
    @update:visible="updateDialogVisible"
    width="220px"
    custom-class="red-envelope-status-dialog"
    center
    append-to-body>
    <div class="dialog-wrapper">
      <div class="paper" v-if="envelope.status==='success'">
        <div class="text">领取成功</div>
        <div class="amount">{{envelope.amount|currency('￥')}}</div>
      </div>
      <div class="paper" v-else-if="envelope.status==='error'">
        <div class="text">领取失败</div>
      </div>
      <div :class="['status-icon', envelope.status]"></div>
      <div class="msg">{{envelope.message}}</div>
      <div class="detail-button">
        <el-button
          v-if="envelope.status==='error'"
          type="primary"
          @click.native="updateDialogVisible(false)">确认
      </el-button>
      <el-button
          v-else
          type="primary"
          @click.native="readDetail(envelope.id)">查看领取详情
      </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'RedEnvelopeStatusDialog',
  props: {
    visible: {
      type: Boolean
    },
    envelope: {
      type: Object,
      default: () => { return {} }
    }
  },
  methods: {
    readDetail (id) {
      this.$emit('update:visible', false)
      this.$emit('read-envelope', id)
    },
    updateDialogVisible (visible) {
      this.$emit('update:visible', visible)
    }
  }
}
</script>
<style lang="scss" scoped>

.el-dialog__wrapper /deep/ .el-dialog.red-envelope-status-dialog {
  background: rgba(0, 0, 0, 0);
   .el-dialog__header {
    display: none;
  }
   .el-dialog__body {
    padding: 0;
  }
}

.dialog-wrapper {
  box-sizing: border-box;
  position: relative;
  width: 220px;
  text-align: center;
  height: 315px;
  padding-top: 120px;
  background: url('../../assets/envelope/dialog.png') no-repeat center 11px;
  background-size: contain;
  .paper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 89px;
    padding-top: 8px;
    margin: 0 auto;
    background: #fff4df;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    clip-path: polygon(100% 0%, 100% 84%, 50% 100%, 50% 100%, 0% 84%, 0 0);
    .text {
      width: 160px;
      background-image: radial-gradient(circle at 50% 50%, #e66551, rgba(239, 108, 85, 0.92) 15%, rgba(255, 244, 223, 0.5) 80%, rgba(255, 244, 223, 0.5));
      color: #fff4df;
    }
    .amount {
      font-size: 32px;
      color: #e66551;
      line-height: 1.6;
    }
  }
  .status-icon {
    width: 50px;
    height: 50px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    margin: 0 auto;
    &.success {
      background-image: url('../../assets/envelope/success.svg');
    }
    &.fail {
      background-image: url('../../assets/envelope/fail.svg');
    }
    &.error {
      background-image: url('../../assets/envelope/error.svg');
    }
  }
  .msg {
    padding-top: 13px;
    font-size: 14px;
    color: #fdebc5;
    line-height: 20px;
    width: 140px;
    word-wrap: break-word;
    margin: 0 auto;
  }

  .detail-button {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 190px;
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    background: transparent;
    margin: 0 auto;
    & /deep/ .el-button.el-button--primary {
      color: #e76953;
      background: #ffd264;
      font-size: 18px;
    }
  }
}
</style>
