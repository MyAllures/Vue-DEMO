<template>
  <el-row>

    <el-alert
      v-if="message"
      :title="message"
      :type="updateStatus"
      :closable="false"
      center />

    <el-alert
      v-if="user && !user.bank && systemConfig.needBankinfo && parseInt(systemConfig.regPresentAmount)"
      type="success"
      :closable="false"
      :title="'添加银行卡信息即可领取注册彩金 ￥' + systemConfig.regPresentAmount"
      center >
      <el-popover
        placement="bottom-start"
        title="注意"
        width="300"
        trigger="hover">
        <ul style="list-style: square inside; color: #999;">
          <li>同一银行卡信息最多仅可领取一次</li>
          <li>同一 IP 最多仅可领取一次，请勿重复注册</li>
          <li>本平台保留对本次活动的全部解释权</li>
        </ul>
        <i class="el-icon-info" slot="reference"></i>
      </el-popover>
    </el-alert>
    <el-col :offset="8" :span="16">
      <el-form :model="member" class="m-t-lg bankinfo__form" status-icon ref="infoform" :rules="infoRules" label-width="120px" @click.native="message=''">
        <el-form-item :label="$t('user.bank')" prop="bank.bank">
          <el-select :disabled="!!user.bank" class="input-width" v-model="member.bank.bank" placeholder="请选择">
            <el-option
              v-for="option in bankOptions"
              :key="option.key"
              :label="option.value"
              :value="option.key">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('user.city')" prop="bank.city">
          <el-input :disabled="!!user.bank" class="input-width" type="text" v-model="member.bank.city"></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.province')" prop="bank.province">
          <el-input :disabled="!!user.bank" class="input-width" type="text" v-model="member.bank.province"></el-input>
        </el-form-item>
        <el-form-item :label="$t('user.username')" prop="bank.account">
          <el-input :disabled="!!user.bank" class="input-width" type="text" v-model="member.bank.account"></el-input>
        </el-form-item>
        <template v-if="isPrimaryInfoEmpty">
          <div class="info-tip">须填写手机号码，用于取款申请核对</div>
          <el-form-item :label="$t('user.phone')" prop="phone" ref="phone">
            <el-input class="input-width" v-model="member.phone"></el-input>
          </el-form-item>
          <el-form-item label="QQ" prop="qq" ref="qq">
            <el-input class="input-width" v-model="member.qq"></el-input>
          </el-form-item>
          <el-form-item :label="$t('user.wechat')" prop="wechat" ref="wechat">
            <el-input class="input-width" v-model="member.wechat"></el-input>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button :disabled="user.bank||!inputCompleted" :loading="loading" class="input-width" type="primary" @click="submitBankInfo">{{$t('action.submit')}}</el-button>
          <div class="tips fade" v-if="user.bank">您的银行卡信息已提交，如需修改请联系客服</div>
          <div class="tips" v-else>银行卡信息提交之后需联系客服方可修改，请谨慎填写。</div>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { validateBankAccount, validateProvince, validateQQ, validatePhone } from '../../validate'
import { fetchBank, updateUser } from '../../api'
import { msgFormatter } from '../../utils'
import { mapGetters } from 'vuex'
export default {
  name: 'BankInfo',
  data () {
    const bankAccountValidator = (rule, value, callback) => {
      if (!validateBankAccount(value)) {
        callback(new Error(this.$t('validate.account_validate')))
      } else if (value.length > 20) {
        callback(new Error('银行帐号需为20位以内的数字'))
      } else {
        callback()
      }
    }
    const provinceValidator = (rule, value, callback) => {
      if (!validateProvince(value)) {
        callback(new Error(this.$t('validate.province_validate')))
      } else {
        callback()
      }
    }
    const qqValidator = (rule, value, callback) => {
      if (!value) {
        callback()
        this.$refs.qq.clearValidate()
      } else if (!validateQQ(value)) {
        callback(new Error(this.$t('validate.qq_validate')))
      } else {
        callback()
      }
    }

    const wechatValidator = (rule, value, callback) => {
      if (!value) {
        callback()
        this.$refs.wechat.clearValidate()
      } else {
        callback()
      }
    }

    const phoneValidator = (rule, value, callback) => {
      if (!validatePhone(value)) {
        callback(new Error(this.$t('validate.phone_validate')))
      } else {
        callback()
      }
    }

    return {
      member: {
        bank: {
          bank: '',
          city: '',
          province: '',
          account: ''
        },
        qq: '',
        phone: '',
        wechat: ''
      },
      loading: false,
      updateStatus: 'success',
      message: '',
      infoRules: {
        'bank.bank': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        'bank.city': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: provinceValidator, trigger: ['blur', 'change'] }
        ],
        'bank.province': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: provinceValidator, trigger: ['blur', 'change'] }
        ],
        'bank.account': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: bankAccountValidator, trigger: ['blur', 'change'] }
        ],
        qq: [
          { validator: qqValidator, trigger: 'change' }
        ],
        phone: [
          { validator: phoneValidator, trigger: 'change' }
        ],
        wechat: [
          {validator: wechatValidator, trigger: 'change'}
        ]
      },
      bankOptions: []
    }
  },
  computed: {
    systemConfig () {
      return this.$store.state.systemConfig
    },
    ...mapGetters([
      'user'
    ]),
    inputCompleted () {
      const bank = this.member.bank
      const member = this.member
      if (!this.isPrimaryInfoEmpty) {
        return bank.bank !== '' &&
          bank.city !== '' &&
          bank.province !== '' &&
          bank.account !== ''
      } else {
        return bank.bank !== '' &&
          bank.city !== '' &&
          bank.province !== '' &&
          bank.account !== '' &&
          member.phone !== ''
      }
    },
    isPrimaryInfoEmpty () {
      const user = this.user
      return !user.phone && !user.qq && (!user.wechat && user.wechat !== 0)
    }
  },
  created () {
    fetchBank(true).then(options => {
      this.bankOptions = options
    })
    const bankInfo = this.$store.state.user.bank
    if (bankInfo) {
      Object.keys(bankInfo).forEach(key => {
        this.member.bank[key] = bankInfo[key]
      })
    }
  },
  methods: {
    submitBankInfo () {
      this.$refs.infoform.validate((valid) => {
        if (valid) {
          this.loading = true
          const sendData = {}
          Object.keys(this.member).forEach(key => {
            let value = this.member[key]
            if (value !== undefined && value !== '') {
              sendData[key] = value
            }
          })
          updateUser(this.$store.state.user.id, sendData).then(data => {
            this.loading = false
            this.$store.dispatch('setUser', data)
            this.updateStatus = 'success'
            this.$refs.infoform.clearValidate()
            this.message = '银行信息已更新'
          }).catch(errorMsg => {
            this.loading = false
            this.updateStatus = 'error'
            this.message = msgFormatter(errorMsg)
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.bankinfo__form {
  box-sizing: border-box;
  padding-bottom: 20px;
}
.tips {
  position: absolute;
  left: 110px;
  transform: translateX(-50%);
  font-size: 12px;
  &.fade {
    color: #999;
  }
}
.el-row /deep/ .el-icon-info {
  margin-left: 5px;
}
.info-tip {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 21px 0 8px 79px;
  color: #666;
  font-size: 13px;
  &::before {
    position: absolute;
    bottom: 6px;
    left: 70px;
    font-size: 16px;
    content: '*';
    color: #f56c6c;
  }
}
</style>
