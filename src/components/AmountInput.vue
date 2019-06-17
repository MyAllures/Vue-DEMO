<template>
  <el-input
    size="mini"
    v-model="currentValue"
    type="number"
    ref="input"></el-input>
</template>

<script>
export default {
  name: 'AmountInput',
  props: {
    value: [String, Number],
    match: {
      type: RegExp,
      default: () => /^([1-9]\d*(\.[\d]{0,1})?|0(\.[\d]{0,1})?)[\d.]*/
    }
  },
  data () {
    return {
      currentValue: this.value
    }
  },
  watch: {
    currentValue: function (val, oldVal) {
      // 調用filter過濾數據
      let formattedValue = this.filter(val)
      formattedValue = this.typeNumberFilter(formattedValue, oldVal)
      if (val !== formattedValue || val === '') {
        setTimeout(() => {
          this.currentValue = formattedValue
        }, 0)
      }
      this.$emit('input', formattedValue)
    },
    value: function (value) {
      this.currentValue = value
    }
  },
  methods: {
    filter (value) {
      let formattedValue = ''
      const match = value.match(this.match)
      if (match) {
        formattedValue = match[1]
      }
      return formattedValue
    },
    typeNumberFilter (val, oldVal) {
      let formattedValue = val
      // 連續輸入..後，type=number的input框會把值修改為''，這裏手動替換為上次的currentValue
      if (formattedValue === '' && oldVal && oldVal.match(/^(\d)[\d.]+/)) {
        formattedValue = oldVal
      }
      return formattedValue
    },
    isBackspace (keyCode) {
      return keyCode === 8
    },
    isDot (keyCode) {
      return keyCode === 46 || keyCode === 110 || keyCode === 190
    },
    isNumber (keyCode) {
      return (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)
    }
  }
}
</script>

