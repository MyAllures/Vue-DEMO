<template>
  <div class="footer">
    <ToolBar></ToolBar>
    <div class="input-container">
      <textarea
        ref="input"
        class="input"
        v-model="value"
        type="text"
        :placeholder="chatConditionMessage"
        @keypress="handleKeyboard"
        @focus="isChatting(true)"
        @blur="isChatting(false)"
        :disabled="noPermission"></textarea>
      <el-button :disabled="noPermission" @click.native="send" type="primary" class="button">发送</el-button>
    </div>
  </div>
</template>
<script>
import ToolBar from './ToolBar'
import { mapState } from 'vuex'

export default {
  components: {
    ToolBar
  },
  data () {
    return {
      value: ''
    }
  },
  computed: {
    ...mapState('chatroom', {
      ws: state => state.ws,
      permission: state => state.permission
    }),
    noPermission () {
      return !this.permission || !this.permission.eligible
    },
    chatConditionMessage () {
      if (this.noPermission && this.permission) {
        return this.permission.messages.join(',')
      } else {
        return '输入信息...'
      }
    }

  },
  methods: {
    handleKeyboard (e) {
      if (e.keyCode === 13) {
        this.send()
        e.preventDefault()
      }
    },
    isChatting (bool) {
      this.$store.dispatch('chatroom/updateIsChatting', bool)
    },
    send () {
      const cleanValue = this.value.trim()
      this.value = ''
      this.$refs.input.focus()

      if (!cleanValue) {
        return
      }
      if (this.noPermission) {
        return false
      }
      this.ws.sendMsg(cleanValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  background-color: #f5f5f5;
  height: 105px;
  padding: 0 5px 5px;
}

.input-container {
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  align-items: center;
  height: 70px;
  width: 100%;
  padding: 5px 0;
}

.input {
  color: #666;
  padding: 5px;
  font-size: 13px;
  resize: none;
  flex: 1 1 auto;
  height: 100%;
  border: none;
  &:focus {
    outline: none;
  }
  &:disabled {
    color: #999;
  }
}

.button {
  margin-right: 5px;
  flex: 0 0 auto;
  height: 40px;
  width: 72px;
  font-size: 14px;
}
</style>
