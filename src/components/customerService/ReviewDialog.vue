<template>
  <transition name="delay-out">
    <div class="cs-review" v-show="show">
      <transition name="fade-up">
        <div class="review-dialog" v-if="show">
          <a class="close" href="#" @click.prevent="close"><i class="el-icon-close"></i></a>
          <div class="title">您对本次服务满意吗？</div>
          <div class="rating">
            <div class="rate-option" :key="i" v-for="(option, i) in RATINGS">
              <label>
                <input type="radio" name="rating" :value="option.value" v-model="rating" :disabled="processing" />
                <img :src="require(`../../assets/cs/icon-rate-${option.value}.svg`)" v-show="rating !== option.value" />
                <img :src="require(`../../assets/cs/icon-rate-${option.value}-2.svg`)" v-show="rating === option.value" />
                <span class="desc" :style="{ color: rating === option.value ? option.color : '#d4d4d4' }">{{ option.desc }}</span>
              </label>
            </div>
          </div>
          <div class="comment">
            <el-input type="textarea" :class="{ focused: commentFocus }" :maxlength="commentLimit" placeholder="请填写评价内容(选填)" v-model="comment" @keyup.native="handleComment" @focus="commentFocus = true" @blur="commentFocus = false" />
            <span class="length">{{ commentLength }}</span>
          </div>
          <div class="submit">
            <el-button type="primary" size="medium" :loading="processing" @click.native="submit">提交</el-button>
          </div>
        </div>
      </transition>
      <transition name="fade-in">
        <div class="review-mask" v-if="show"></div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { sendServiceReview } from '@/api'
import { MSG_TYPE, MSG_CAT, RATINGS } from '@/utils/customerService'

export default {
  props: {
    show: Boolean
  },
  data: () => ({
    RATINGS,
    rating: 0,
    comment: '',
    processing: false,
    commentFocus: false,
    commentLimit: 100
  }),
  methods: {
    ...mapActions('customerService', [
      'showReviewDialog'
    ]),
    handleComment () {
      if (this.comment.length >= this.commentLimit) {
        this.comment = this.comment.substring(0, this.commentLimit)
      }
    },
    submit () {
      if (this.rating === 0) {
        this.$notify.error({
          title: '错误',
          message: '请选择评价！',
          duration: 3000,
          position: 'bottom-right'
        })
        return
      }
      this.processing = true
      const session = this.session || this.lastSession
      this.handleComment()
      sendServiceReview({
        session: session,
        rating: this.rating,
        comment: this.comment
      }).then(response => {
        this.reviewSucceed(response)
        this.processing = false
        this.close()
      })
    },
    reviewSucceed (response) {
      const successMsg = {
        id: response.id,
        session: response.session,
        rating: response.rating,
        cat: MSG_CAT.common,
        text: response.comment,
        type: MSG_TYPE.review
      }
      this.$store.dispatch('customerService/receiveMessages', {
        category: MSG_CAT.common,
        messages: [successMsg],
        once: false
      })
      const thankMsg = {
        session: response.session,
        cat: MSG_CAT.common,
        text: this.thankMessage,
        type: MSG_TYPE.reviewThank
      }
      this.$store.dispatch('customerService/receiveMessages', {
        category: MSG_CAT.common,
        messages: [thankMsg],
        once: false
      })
    },
    close () {
      this.rating = 0
      this.comment = ''
      this.showReviewDialog(false)
    }
  },
  computed: {
    ...mapState('customerService', {
      thankMessage: state => state.received.thank
    }),
    ...mapGetters('customerService', {
      lastSession: 'lastSession',
      session: 'currentSession'
    }),
    commentLength () {
      return this.commentLimit - this.comment.length
    }
  }
}
</script>

<style>
.cube-popup-content {
  line-height: 1;
}
</style>
<style lang="scss" scoped>
.cs-review {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.review-dialog {
  width: 360px;
  position: absolute;
  left: 0;
  right: 0;
  top: 100px;
  margin: auto;
  padding: 15px 20px;
  font-size: 14px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(#000, .1);
  box-sizing: border-box;
  z-index: 1;
}
.close {
  position: absolute;
  top: 12px;
  right: 12px;
}
.title {
  color: #666;
  text-align: center;
  line-height: 22px;
}
.rating {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.rate-option {
  flex: 0 0 45px;
  margin: 0 10px;
  text-align: center;

  label {
    display: block;
    cursor: pointer;
  }
  input {
    position: absolute;
    width: 0;
    opacity: 0;
  }
  img {
    display: block;
  }
  .desc {
    display: block;
    margin-top: 3px;
    color: #d4d4d4;
  }
}
.comment, .submit {
  margin-top: 10px;
}
.comment {
  position: relative;

  /deep/ textarea {
    resize: none;
  }
  .length {
    position: absolute;
    right: 6px;
    bottom: 2px;
    color: #d8d8d8;
    opacity: 0;
    transition: opacity .1s linear;
  }
  .el-textarea.focused + .length {
    opacity: 1;
  }
}
.submit {
  button {
    display: block;
    width: 100%;
  }
}
.review-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(#000, .35);
}

.delay-out-leave-active {
  transition: all .3s ease-out;
}
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all .3s ease-out;
}
.fade-up-enter {
  transform: translateY(10px);
  opacity: 0;
}
.fade-up-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
