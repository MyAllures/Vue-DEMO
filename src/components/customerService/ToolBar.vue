<template>
  <div class="toolbar">
    <el-popover :popper-class="'emoji-popover'"
      @show="handlePopoverShow"
      ref="sticker-popover"
      v-model="stickerPopoverVisible"
      placement="top-start"
      :width="stickerTab === 'stickers' ? 350 : 300"
      :offset="50"
      trigger="click">
      <el-tabs type="border-card" class="stickers-tab" v-model="stickerTab">
        <el-tab-pane label="表情符号" name="emojis">
          <div class="emoji-container">
            <Emojis :emojis="emojis" @emojiClick="handleEmojiClick"/>
          </div>
        </el-tab-pane>
        <el-tab-pane label="表情包" name="stickers" v-if="stickerGroups.length">
          <div class="stickers-container">
            <Stickers :stickerGroups="stickerGroups"
              @handleStickerClick="handleStickerClick"
              :stickers="stickers"
              :roomId="RECEIVER"
              :ws="ws"/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
    <a class="tool-button m-r" title="表情符号/表情包">
      <img v-popover:sticker-popover class="sticker-icon" src="@/assets/icon_sticker.svg" alt="sticker" />
    </a>
    <label for="serviceUploadInput" class="tool-button m-r" title="上传图片">
      <img class="upload-icon" src="@/assets/icon_upload.svg" alt="upload" />
      <input @change="sendMsgImg"
        type="file"
        ref="serviceImgSend"
        class="img-upload-input"
        id="serviceUploadInput"
        accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif" />
    </label>
    <a class="tool-button m-r" title="评价" @click.prevent="showReview" v-if="enableReview">
      <img class="review-icon" src="@/assets/cs/icon-review.svg" alt="review" />
    </a>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Stickers from '../Stickers'
import Emojis from '../Emojis'
import { fetchServiceEmoji, fetchServiceStickers, uploadImgToService } from '@/api'
import { EMITTED_ACTION } from '@/utils/customerService'
import { msgFormatter } from '@/utils'

export default {
  components: {
    Stickers,
    Emojis
  },
  data () {
    return {
      stickerPopoverVisible: false,
      stickerTab: 'emojis',
      stickerGroups: [],
      stickers: {},
      emojis: [],
      RECEIVER: 0,
      ws: ''
    }
  },
  methods: {
    ...mapActions('customerService', [
      'showReviewDialog'
    ]),
    sendMsgImg (e) {
      let fileInp = this.$refs.serviceImgSend
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
      formData.append('receivers', this.RECEIVER)
      formData.append('image', file)
      uploadImgToService(formData).then((data) => {
        fileInp.value = ''
      }, err => {
        this.$message.warning(msgFormatter(err))
      })
    },
    handlePopoverShow () {
      if (!this.emojis.length) {
        this.fetchEmojis()
      }
    },
    handleEmojiClick (emoji) {
      this.$emit('handleEmojiClick', emoji.emoji + ' ')
    },
    handleStickerClick (sticker) {
      this.$store.state.ws.venom.send({action: EMITTED_ACTION.sticker, parameter: {id: sticker.id}})
    },
    fetchEmojis () {
      fetchServiceEmoji().then((res) => {
        let emojis = []
        if (res.people) {
          emojis = res.people.slice(0, 42)
        }
        this.emojis = emojis
      }).catch(err => console.log(err))
    },
    getStickers () {
      if (!this.stickerGroups.length) {
        fetchServiceStickers().then((res) => {
          if (!res) {
            return
          }
          this.stickerGroups = res.map(sticker => {
            this.stickers[sticker.display_name] = sticker.stickers
            return {
              display_name: sticker.display_name,
              logo: sticker.cover,
              name: sticker.display_name
            }
          })
        }).catch(() => {})
      }
    },
    showReview () {
      this.showReviewDialog()
    }
  },
  computed: {
    ...mapState('customerService', {
      enableReview: state => state.enableReview
    })
  },
  created () {
    this.fetchEmojis()
    this.getStickers()
  }
}
</script>

<style lang="scss" scoped>
.tool-button {
  display: inline-block;
  width: 21px;
  height: 21px;
  vertical-align: middle;
  cursor: pointer;

  img {
    height: 100%;
  }
}
.emoji-container {
  height: 280px;
  overflow-y: auto;
}

.img-upload-input {
  display: none;
}
</style>
