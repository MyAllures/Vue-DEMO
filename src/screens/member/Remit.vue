<template>
  <el-row class="m-t">
    <el-tabs v-model="activeName" class="indented-tab" type="card" @tab-click="chooseRemitWay">
      <el-tab-pane :label="item.payee_name || item.nickname"
        :name="item.id + ''"
        v-for="(item, index) in remitPayees"
        :key="index">
        <el-alert
          :title="limitAlert"
          type="info"
          :closable="false">
        </el-alert>
        <el-row class="m-t-lg" v-if="item.remit_type.id == 1">
          <el-col :push="2" :span="7">
            <p class="m-l m-b-sm bank-tip">存款银行资料</p>
            <ul class="list-group m-l">
              <li class="list-group-item clearfix">
                <span class="text-muted fl">银行账号</span>
                <span class="fr bank-account">{{item.account}}</span>
              </li>
              <li class="list-group-item clearfix">
                <span class="text-muted fl">银行</span>
                <span class="fr">{{bankMap[item.bank]}}</span>
              </li>
              <li class="list-group-item clearfix">
                <span class="text-muted fl">银行开户行</span>
                <span class="fr">{{item.address}}</span>
              </li>
              <li class="list-group-item clearfix">
                <span class="text-muted fl">银行开户名</span>
                <span class="fr">{{item.payee_name}}</span>
              </li>
            </ul>
            <ul class="info-tips m-l">
              <li>1. 您在给转帐 时请仔细核对存款信息</li>
              <li>2. 请认真填写存款人信息，以免核对出错</li>
              <li>3. 填写存款表单完成后，可在财务纪录当中查看存款状态</li>
            </ul>
          </el-col>
          <el-col :push="2" class="m-l-xlg" :span="14">
            <el-form class="m-t-lg" :model="remitData" status-icon :ref="item.id" :rules="remitDataRules" label-width="150px">
              <el-form-item :label="$t('user.balance')">
                {{$store.state.user.balance | currency('￥') }}
              </el-form-item>
              <el-form-item v-if="item.remit_type.need_depositor" label="存款人" prop="remit_info.depositor">
                <el-input :key="item.id" clearable class="input-width" v-model="remitData.remit_info.depositor" :placeholder="$t('user.remit_please_name')"></el-input>
              </el-form-item>
              <el-form-item label="存款金额" prop="amount">
                <el-input clearable
                  @blur="remitData.amount = Math.round(remitData.amount * 100)/100"
                  class="input-width"
                  placeHolder="请输入存款金额"
                  v-model.number="remitData.amount"
                  type="number"
                  @keypress.native="filtRemitAmount($event, remitData.amount)"
                  :min="limit.lower"
                  :max="limit.upper"></el-input>
              </el-form-item>
              <el-form-item v-if="item.remit_type.need_last_six_digits"
                label="转帐单号后 6 位数字"
                prop="remit_info.last_six_digits">
                <el-input class="input-width" @keypress.native="handleLastSixDigitIpt($event, remitData.remit_info.last_six_digits)" v-model="remitData.remit_info.last_six_digits"></el-input>
              </el-form-item>
              <el-form-item :label="$t('common.memo')" prop="memo">
                <el-input clearable class="input-width" v-model="remitData.memo"></el-input>
              </el-form-item>
              <el-form-item class="info-tips" :label="''" prop="memo">
                {{remitPayees[index].client_description}}
              </el-form-item>
              <el-form-item>
                <el-button class="m-r-lg input-width" type="primary" :disabled="remiting" @click="submitRemitForm(item.id)">提交存款资料</el-button>
                <router-link v-show="successPayeeId" to="/account/finance/payment_record">查看存款纪录</router-link>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        <el-row class="m-t-lg" v-else>
          <el-col :push="3" :span="7" class="m-t-lg">
             <img width="200" height="200" :src="item.qr_code" alt="">
             <p class="text-info m-t-lg">请用手机扫描此二维码进行 </p>
          </el-col>
          <el-col :push="2" class="m-l-lg" :span="14">
            <el-form class="m-t-lg" :model="remitData" status-icon :ref="item.id" :rules="remitDataRules" label-width="150px">
              <el-form-item :label="$t('user.balance')">
                {{$store.state.user.balance | currency('￥') }}
              </el-form-item>
              <el-form-item v-if="item.remit_type.need_depositor" label="存款人" prop="remit_info.depositor">
                <el-input class="input-width" v-model="remitData.remit_info.depositor"></el-input>
              </el-form-item>
              <el-form-item label="存款金额" prop="amount">
                <el-input class="input-width" clearable
                  @blur="remitData.amount = Math.round(remitData.amount * 100)/100"
                  v-model.number="remitData.amount"
                  type="number"
                  @keypress.native="filtRemitAmount($event, remitData.amount)"
                  :min="limit.lower"
                  :max="limit.upper">
                </el-input>
              </el-form-item>
              <el-form-item v-if="item.remit_type.need_last_six_digits" label="转帐单号后 6 位数字" prop="remit_info.last_six_digits">
                <el-input class="input-width" type="text" @keypress.native="handleLastSixDigitIpt($event, remitData.remit_info.last_six_digits)" v-model="remitData.remit_info.last_six_digits"></el-input>
              </el-form-item>
              <el-form-item :label="$t('common.memo')" prop="memo">
                <el-input class="input-width" v-model="remitData.memo"></el-input>
              </el-form-item>
              <el-form-item class="info-tips" :label="''" prop="memo">
                {{remitPayees[index].client_description}}
              </el-form-item>
              <el-form-item>
                <el-button class="m-r-lg input-width" type="primary" :disabled="remiting" @click="submitRemitForm(item.id)">提交存款资料</el-button>
                <router-link v-show="successPayeeId" to="/account/finance/payment_record">查看存款纪录</router-link>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>
<script>
import { fetchRemitpayee, remit, fetchBank } from '../../api'
import { validateLastSixDigits } from '../../validate'
import { msgFormatter, filtAmount } from '../../utils'

export default {
  name: 'Remit',
  data () {
    let limitPass = (rule, value, callback) => {
      const lower = this.limit.lower ? parseFloat(this.limit.lower) : null
      const upper = this.limit.upper ? parseFloat(this.limit.upper) : null
      if (!value) {
        callback(new Error('请输入合法数字'))
      }
      if (lower && value < lower) {
        callback(new Error(this.$t('validate.min_amount_validate')))
      } else if (upper && value > upper) {
        callback(new Error(this.$t('validate.max_amount_validate')))
      } else {
        callback()
      }
    }
    const accountLastDigitsValidator = (rule, value, callback) => {
      if (!validateLastSixDigits(value)) {
        callback(new Error('请输入 6 位数字'))
      } else {
        callback()
      }
    }
    return {
      remitPayees: [],
      activeName: '',
      successPayeeId: '',
      remitData: {
        amount: '',
        memo: '',
        remit_info: {
          remit_payee: '',
          depositor: '',
          last_six_digits: ''
        }
      },
      remitDataRules: {
        'remit_info.depositor': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        amount: [
          { required: true, type: 'number', message: this.$t('validate.required_num'), trigger: 'blur' },
          { validator: limitPass, trigger: ['blur', 'change'] }
        ],
        'remit_info.last_six_digits': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: accountLastDigitsValidator, trigger: ['blur', 'change'] }
        ]
      },
      bankMap: {},
      nowTab: 'bank',
      tabs: [
        {
          label: this.$t('user.bank'),
          key: 'bank'
        },
        {
          label: 'QR Code',
          key: 'qrcode'
        }
      ],
      remiting: false
    }
  },
  computed: {
    limit () {
      const level = this.$store.state.user.level
      return level ? level.remit_limit : {}
    },
    limitAlert () {
      let alerts = []
      const lowerAlert = this.limit.lower ? `${this.$t('user.min_amount')}: ￥${this.limit.lower}` : null
      const upperAlert = this.limit.upper ? `${this.$t('user.max_amount')}: ￥${this.limit.upper}` : null
      if (lowerAlert) {
        alerts.push(lowerAlert)
      }
      if (upperAlert) {
        alerts.push(upperAlert)
      }
      return alerts.join(', ')
    }
  },
  created () {
    fetchBank().then(banks => {
      banks.forEach(bank => {
        this.bankMap[bank.key] = bank.value
      })
      fetchRemitpayee().then(payees => {
        this.remitPayees = payees.filter(p => p.payee_name || p.nickname)
        this.activeName = this.remitPayees.length ? String(this.remitPayees[0].id) : ''

        if (this.remitPayees.length) {
          this.chooseRemitWay(this.remitPayees[0])
        }
      })
    })
  },
  methods: {
    handleLastSixDigitIpt (evt, val) {
      const reg = /^[0-9]{0,6}$/
      if (!reg.test(evt.key) || val.length === 6) {
        evt.preventDefault()
      }
    },
    filtRemitAmount (evt, val) {
      let reg = /^([0-9][0-9]*([.][0-9]{0,2})?)$/

      let patched = (String(val) + evt.key)
      if (!reg.test(patched)) {
        evt.preventDefault()
      }
    },
    submitRemitForm (payeeId) {
      this.$refs[payeeId][0].validate((valid) => {
        if (valid) {
          this.remiting = true
          remit(this.remitData).then(data => {
            let remitType = ''
            try {
              const currentRemitData = this.remitPayees.find(data => data.id + '' === this.activeName)
              if (currentRemitData && currentRemitData.remit_type) {
                switch (currentRemitData.remit_type.id) {
                  case 1:
                    remitType = '銀行'
                    break
                  case 2:
                    remitType = '微信'
                    break
                  case 3:
                    remitType = '支付宝'
                    break
                  default:
                    remitType = ''
                }
              }
            } catch (e) {}
            this.sendGaEvent({action: ' ', category: '線下匯款', label: remitType + '轉帳'})
            this.successPayeeId = this.remitData.remit_info.remit_payee
            this.$message({
              showClose: true,
              message: this.$t('message.submit_success'),
              type: 'success'
            })
            this.remiting = false
            this.$refs[payeeId][0].resetFields()
          }, errorMsg => {
            this.remiting = false
            this.$message({
              showClose: true,
              message: msgFormatter(errorMsg),
              type: 'error'
            })
          })
        }
      })
    },
    filtAmount,
    chooseRemitWay (tab, e) {
      for (let key in this.$refs) {
        this.$refs[key] instanceof Array && this.$refs[key][0] && this.$refs[key][0].resetFields && this.$refs[key][0].resetFields()
      }
      this.remitData.remit_info.remit_payee = tab.name || tab.id
      this.successPayeeId = ''
    }
  }
}
</script>

<style scoped lang="scss">
.text-info {
  color: #31708f;
}
.text-muted {
  color: #777;
}
.bank-tip {
  font-size: 14px;
  font-weight: bold;
}
.list-group {
  padding-left: 0;
  margin-bottom: 20px;
  .list-group-item:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .list-group-item:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .list-group-item {
    position: relative;
    display: block;
    padding: 5px 15px;
    margin-bottom: -1px;
    background-color: #fff;
    border: 1px solid #ddd;
    span {
      font-size: 14px;
    }
    .bank-account {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
.info-tips {
  color: #999;
}

</style>
