<template>
<el-row >
  <el-col :span="10" :offset="7">
    <el-alert
      v-if="message"
      :title="message"
      :type="updateStatus"
      :closable="false"
      center>
    </el-alert>
    <el-form :model="member" status-icon :rules="rules" ref="user" label-width="150px" @click.native="message=''">
      <el-form-item :label="$t('user.username')">
        {{user.username}}
      </el-form-item>
      <el-form-item :label="$t('user.balance')">
        {{user.balance | currency('￥') }}
      </el-form-item>
      <el-form-item :label="$t('user.realname')">
        {{user.real_name}}
      </el-form-item>
      <el-form-item v-if="user.phone" :label="$t('user.phone')">
        {{user.phone}}
      </el-form-item>
      <el-form-item v-else :label="$t('user.phone')" prop="phone" ref="phone">
        <el-input class="input-width" v-model="member.phone"></el-input>
      </el-form-item>
      <el-form-item :label="$t('user.email')" ref="email" prop="email">
        <el-input class="input-width" v-model="member.email"></el-input>
      </el-form-item>
      <el-form-item label="QQ" prop="qq" ref="qq">
        <el-input class="input-width" v-model="member.qq"></el-input>
      </el-form-item>
      <el-form-item :label="$t('user.wechat')" ref="wechat" prop="wechat">
        <el-input class="input-width" v-model="member.wechat"></el-input>
      </el-form-item>
      <el-form-item :label="'昵称'" prop="nickname">
        <el-input class="input-width" v-model="member.nickname"></el-input>
      </el-form-item>
      <el-form-item :label="'头像'" prop="avatar">
        <label class="avatar-trigger clickable" for="avatarIpt" >
          <i :class="['avatar-ipt', 'el-icon-plus', 'avatar-uploader-icon', {'preview': member.avatar}]">
            <img v-if="member.avatar" class="avatar" :src="member.avatar" alt="avatar">
          </i>
          <span class="avatar-tip" v-if="member.avatar">更换头像</span>
          <input type="file"
            @change="avatarIpt"
            ref="avatarIpt"
            class="hidden"
            id="avatarIpt"
            accept=".jpg, .png, .gif, .jpeg, image/jpeg, image/png, image/gif">
        </label>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
          v-loading="loading"
          class="input-width"
          :disabled="updatedField.length===0"
          @click="submitForm">{{$t('action.save')}}</el-button>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
</template>
<script>
import { msgFormatter } from '../../utils'
import { validateQQ, validatePhone } from '../../validate'
import { mapState } from 'vuex'
import {filter, each} from 'lodash'
export default {
  name: 'PrimaryInfo',
  data () {
    const user = this.$store.state.user
    const qqValidator = (rule, value, callback) => {
      if (user.qq === value) { // 若和原值相同則不需要檢核
        callback()
        this.$refs.qq.clearValidate()
      } else if (!validateQQ(value)) {
        callback(new Error(this.$t('validate.qq_validate')))
      } else {
        callback()
      }
    }

    const emailValidator = (rule, value, callback) => {
      if (user.email === value) {
        callback()
        this.$refs.email.clearValidate()
      } else if (!value) {
        callback(new Error(this.$t('validate.email_validate')))
      } else {
        callback()
      }
    }

    const wechatValidator = (rule, value, callback) => {
      if (user.wechat === value) {
        callback()
        this.$refs.wechat.clearValidate()
      } else if (!value) {
        callback(new Error(this.$t('validate.wechat_validate')))
      } else {
        callback()
      }
    }
    const phoneValidator = (rule, value, callback) => {
      if (user.phone === value) {
        callback()
        this.$refs.phone.clearValidate()
      } else if (!validatePhone(value)) {
        callback(new Error(this.$t('validate.phone_validate')))
      } else {
        callback()
      }
    }
    const nicknameValidator = (rule, value, callback) => {
      if (value.length < 11) {
        callback()
      } else {
        callback(new Error('昵称需为10个字內'))
      }
    }
    return {
      member: {
        email: '',
        phone: '',
        qq: '',
        wechat: '',
        avatar: '',
        nickname: ''
      },
      rules: {
        email: [
          { type: 'email', message: this.$t('validate.email_validate'), trigger: 'change' },
          { validator: emailValidator, trigger: 'change' }
        ],
        qq: [
          { validator: qqValidator, trigger: 'change' }
        ],
        phone: [
          { validator: phoneValidator, trigger: 'change' }
        ],
        wechat: [
          { validator: wechatValidator, trigger: 'change' }
        ],
        nickname: [
          { validator: nicknameValidator, trigger: 'change' }
        ]
      },
      updateStatus: 'success',
      message: '',
      loading: false,
      sendData: new FormData()
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    updatedField () {
      return filter(Object.keys(this.member), key => (this.member[key] !== this.user[key]))
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      each(Object.keys(this.member), key => { this.member[key] = this.user[key] })
    },
    avatarIpt () {
      if (this.sendData.has('avatar')) { this.sendData.delete('avatar') }
      const file = this.$refs.avatarIpt.files[0]
      this.member.avatar = URL.createObjectURL(file)
      this.sendData.append('avatar', file)
    },
    submitForm () {
      if (this.loading) {
        return
      }
      let isValid = true

      each(this.updatedField, field => {
        this.$refs['user'].validateField(field, (errorMsg) => {
          if (errorMsg) {
            isValid = false
          } else {
            if (field === 'avatar') { // handling in avatarIpt
              return
            }
            let value = this.member[field]
            if (value !== '') {
              if (this.sendData.has(field)) {
                this.sendData.delete(field)
              }
              this.sendData.append(field, value)
            }
          }
        })
      })

      if (isValid) {
        this.loading = true
        this.$store.dispatch('updateUser', {userId: this.user.id, updateData: this.sendData}).then(
          (data) => {
            this.init()
            this.$refs['user'].clearValidate()
            this.updateStatus = 'success'
            this.message = this.$t('message.save_success')
            this.loading = false
          }
        ).catch(errorMsg => {
          this.loading = false
          this.updateStatus = 'error'
          this.message = msgFormatter(errorMsg)
        })
      }
    }
  }
}
</script>

<style lang="scss">
@import '../../style/vars.scss';

.avatar {
  &-trigger {
    display: inline-block;
    height: 100%;
    &:hover {
      opacity: .8;
    }
  }
  &-ipt {
    position: relative;
    display: inline-block;
    width: 120px;
    height: 120px;
    line-height: 120px;
    border: 2px dashed #ddd;
    color: #999;
    font-size: 24px;
    text-align: center;
    &.preview {
      border: 2px solid #ddd;
      .avatar {
        position: absolute;
        left: 0;
        top: 0;
        width: 120px;
        height: 120px;
        background-color: #ddd;
      }
    }
    }

  &-tip {
    position: absolute;
    bottom: -8px;
    left: 130px;
    text-decoration: underline;
    color: $primary;
  }
}
</style>
