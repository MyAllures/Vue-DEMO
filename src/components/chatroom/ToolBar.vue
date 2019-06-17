<template>
  <div class="tools">
    <el-popover :popper-class="'emoji-popover'"
      :disabled="noPermission"
      ref="sticker-popover"
      v-model="stickerPopoverVisible"
      placement="top-start"
      :width="350"
      :offset="50"
      trigger="click">
      <div class="stickers-container" v-if="stickers">
        <Stickers :stickerGroups="stickerGroups"
          @handleStickerClick="handleStickerClick"
          :stickers="stickers"/>
      </div>
    </el-popover>
    <div v-if="isEnvelopeEnable" :class="['btn m-r', {disabled: noPermission}]" @click="openRedEnvelopeDialog">
      <icon name="red-envelope" scale="1.5"/>
    </div>
    <label for="chatroomUploadInput" :class="['btn m-r', {disabled: noPermission}]">
      <icon name="picture" scale="1.5"/>
      <input v-if="!noPermission"
        @change="sendMsgImg"
        type="file"
        ref="chatroomImgSend"
        class="img-upload-input"
        id="chatroomUploadInput"
        accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif">
    </label>
    <div v-popover:sticker-popover :class="['btn', {disabled: noPermission}]">
      <icon name="smile" scale="1.5"/>
    </div>
    <red-envelope-dialog :visible.sync="redEnvelopeDialogVisible"/>
  </div>
</template>

<script>
import {eagle} from '@/api'
import { mapState } from 'vuex'
import Stickers from '../Stickers'
import {msgFormatter} from '../../utils'
import RedEnvelopeDialog from './RedEnvelopeDialog'
import '@/components/icon/picture'
import '@/components/icon/red-envelope'
import '@/components/icon/smile'
export default {
  components: {
    Stickers,
    RedEnvelopeDialog
  },
  data () {
    return {
      stickerPopoverVisible: false,
      stickerTab: 'emojis',
      stickerGroups: null,
      stickers: null,
      redEnvelopeDialogVisible: false,
      envelope: {
        pack_amount: '',
        pack_nums: '',
        content: ''
      },
      envelopeLoading: false,
      envelopeError: '',
      validators: {
        'pack_amount': {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入金额'
            } else {
              value = parseInt(value)
              if (value < this.envelopeSetting.min_amount) {
                return '须高于最低金额限制'
              } else if (value > this.envelopeSetting.max_amount) {
                return '不能超过最高金额限制'
              } else {
                return ''
              }
            }
          }
        },
        'pack_nums': {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入个数'
            } else {
              value = parseInt(value)
              if (value > this.envelopeSetting.max_count) {
                return '红包数量超出限制'
              } else {
                return ''
              }
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapState([
      'user', 'systemConfig'
    ]),
    ...mapState('chatroom', {
      ws: state => state.ws,
      permission: state => state.permission,
      roomId: state => state.roomId,
      emojiMap: state => state.emojiMap,
      isManager: state => state.isManager
    }),
    envelopeSetting () {
      return this.$store.state.systemConfig.chatroomEnvelopeSettings || {}
    },
    isEnvelopeEnable () {
      const envelopeSetting = this.envelopeSetting
      if (envelopeSetting.enabled !== true) {
        return false
      }
      if (envelopeSetting.manager_only !== false) {
        return this.isManager
      }
      return true
    },
    noPermission () {
      return !this.permission || !this.permission.eligible
    },
    stickerSeries () {
      if (!this.emojiMap) {
        return []
      }
      return Object.values(this.emojiMap).sort((a, b) => a.order - b.order)
    }
  },
  watch: {
    'stickerSeries': {
      handler: function (series) {
        if (series.length > 0) {
          this.activeSeries = Object.keys(this.emojiMap)[0]
          const stickers = {}
          const stickerGroups = series.map(sticker => {
            stickers[sticker.display_name] = sticker.stickers
            return {
              display_name: sticker.display_name,
              logo: sticker.cover,
              name: sticker.display_name
            }
          })
          this.stickers = stickers
          this.stickerGroups = stickerGroups
        }
      },
      immediate: true
    }
  },
  methods: {
    sendMsgImg (e) {
      let fileInp = this.$refs.chatroomImgSend
      let file = fileInp.files[0]
      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value)) {
        this.$message.warning('文件格式不正确或您目前尚不符合发言条件')
        fileInp.value = ''
        return
      }
      if (file.size > 1024 * 1024) {
        this.$message.warning('图片尺寸太大，请选择较小尺寸的图片。')
        fileInp.value = ''
        return
      }
      let formData = new FormData()
      formData.append('receiver', this.ws.roomId)
      formData.append('image', file)
      this.$store.dispatch('chatroom/receiveMsg', {
        type: 'image',
        isFake: true,
        sender: {
          username: this.user.username
        },
        content: URL.createObjectURL(file)
      })
      eagle.sendImg(formData).then((data) => {
        fileInp.value = ''
      }).catch(errRes => {
        this.$message.warning(msgFormatter({msg: errRes.data.messages}))
      })
    },
    handleStickerClick (sticker) {
      this.ws.sendSticker(sticker.id)
    },
    openRedEnvelopeDialog () {
      if (this.noPermission) {
        return
      }
      this.redEnvelopeDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.tools {
  display: flex;
  align-items: center;
  height: 35px;
}
.btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 35px;
  color: #999;
  cursor: pointer;
  outline: none;
  &.disabled {
    color: #ddd;
    cursor: not-allowed;
  }
}

.img-upload-input {
  display: none;
}

</style>
