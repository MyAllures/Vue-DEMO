<template>
  <CustomDialog :visible="show" @hide="hide" :backClose="true">
    <div class="main">
      <a class="close" href="#" @click.prevent="hide"><i class="el-icon-close"></i></a>
      <div class="header">
        <div class="title" :class="{ error: isError }">领取{{ isError ? '失败' : '成功' }}</div>
        <div class="amount" v-if="!isError">¥{{ data.amount }}</div>
      </div>
      <div class="content">
        <div class="icon">
          <img src="@/assets/red-envelope-v2/envelope-dialog-fail.svg" v-if="isError" />
          <img src="@/assets/red-envelope-v2/envelope-dialog-success.svg" v-else />
        </div>
        <div class="desc">
          <span v-if="isError">{{ data.available_status }}</span>
          <span v-else>可在优惠和红包纪录中查询红包纪录</span>
        </div>
      </div>
      <div class="footer">
        <div class="prompt" v-if="hasMore">还可拆 {{ remain }} 个红包</div>
        <button v-if="hasMore" @click="openNext">继续拆</button>
        <button v-else-if="isError" @click="hide">确认</button>
        <button v-else @click="goto('/account/finance/discount_record')">查看红包纪录</button>
      </div>
    </div>
  </CustomDialog>
</template>

<script>
import CustomDialog from '@/components/CustomDialog'

export default {
  name: 'RedEnvDialog',
  props: {
    data: Object,
    remain: Number,
    show: Boolean
  },
  components: {
    CustomDialog
  },
  methods: {
    hide () {
      this.$emit('hide')
    },
    goto (path) {
      this.hide()
      this.$router.push(path)
    },
    openNext () {
      this.$emit('next')
    }
  },
  computed: {
    isError () {
      return !this.data.amount
    },
    hasMore () {
      return this.remain > 0
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  width: 222px;
  height: 317px;
  background: url(../../assets/red-envelope-v2/envelope-dialog.png) no-repeat;
  background-size: 222px 317px;
  margin: 0 auto;
  position: relative;
  text-align: center;
  font-size: 14px;
  z-index: 1;
}
.close {
  display: block;
  position: absolute;
  top: -30px;
  right: -30px;
  color: #FFF;
}
.header {
  padding-top: 10px;

  .title {
    width: 160px;
    height: 19px;
    background: url(../../assets/red-envelope-v2/envelope-dialog-title.svg) no-repeat;
    background-size: 160px 19px;
    line-height: 19px;
    text-align: center;
    margin: 0 auto;
    color: #FFF;

    &.error {
      margin-top: 20px;
    }
  }
  .amount {
    font-size: 32px;
    font-weight: bold;
    color: #e66551;
    line-height: 50px;
  }
}
.content {
  position: absolute;
  top: 120px;
  width: 100%;

  .desc {
    width: 140px;
    margin: 0 auto;
    color: #fdebc5;
    line-height: 20px;
  }
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;

  .prompt {
    font-size: 10px;
    color: #fdebc5;
  }
  button {
    font-size: 16px;
    font-weight: bold;
    font-family: inherit;
    width: 100%;
    height: 40px;
    color: #c55141;
    background: #f9d275;
    padding: 10px;
    border: none;
    border-radius: 4px;
    outline: none;
    cursor: pointer;
 }
}
</style>
