<template>
  <div class="footer" v-loading="!ready">
    <div class="tool-bar" v-if="ready">
      <ToolBar @handleEmojiClick="handleEmojiClick" />
    </div>
    <div class="input-container">
      <textarea ref="input" class="input" type="text" placeholder="输入信息..." v-model="value" @keypress="handleKeyboard"></textarea>
      <el-button type="primary" class="button" :disabled="!ready" @click.native="send">发送</el-button>
    </div>
  </div>
</template>

<script>
import ToolBar from './ToolBar'

export default {
  props: {
    ready: Boolean
  },
  components: {
    ToolBar
  },
  data () {
    return {
      value: ''
    }
  },
  methods: {
    handleKeyboard (e) {
      if (e.keyCode === 13) {
        this.send()
        e.preventDefault()
      }
    },
    handleEmojiClick (emoji) {
      this.value = `${this.value} ${emoji}`
      this.$refs.input.focus()
    },
    send () {
      const cleanValue = this.value.trim()
      this.value = ''
      this.$refs.input.focus()

      if (!cleanValue) {
        return
      }
      this.$store.state.ws.venom.send({action: 'normal', parameter: {text: cleanValue}})
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 0 5px 5px;
}

.tool-bar {
  height: 35px;
  line-height: 35px;
}
.input-container {
  display: flex;
  width: 100%;
}

.input {
  padding: 4px;
  color: #666;
  resize: none;
  flex: 1;
  height: 46px;
  margin-right: 5px;
  border-radius: 4px;
  border: none;
  &:focus {
    outline: none;
  }
}

.button {
  height: 54px;
  font-size: 16px;
  flex: 0 0 75px;
}
</style>
