const pattern = {
  username: /^[a-zA-Z0-9]{6,15}$/,
  password: /^[a-zA-Z0-9]{6,15}$/,
  qq: /^[0-9]{4,}$/,
  phone: /^[1][3-9]\d{9}$/,
  bankAccount: /^[0-9]{10,}$/,
  withdrawPassword: /^[0-9]{6}$/,
  real_name: /[\u4E00-\u9FA5]/,
  province: /^[\u4E00-\u9FA5]{0,}$/,
  amount: /^([0-9][0-9]*([.][0-9]{0,1})?)$/,
  sixDigits: /^[0-9]{6}$/
}
export function validateUserName (value) {
  return pattern.username.test(value)
}

export function validatePassword (value) {
  return pattern.password.test(value)
}

export function validateQQ (value) {
  return pattern.qq.test(value)
}

export function validateRealName (value) {
  return pattern.real_name.test(value)
}

export function validateAmount (value) {
  return pattern.amount.test(value)
}

export function validateProvince (value) {
  return pattern.province.test(value)
}

export function validatePhone (value) {
  return pattern.phone.test(value)
}

export function validateBankAccount (value) {
  return pattern.bankAccount.test(value)
}

export function validateWithdrawPassword (value) {
  return pattern.withdrawPassword.test(value)
}

export function validateLastSixDigits (value) {
  return pattern.sixDigits.test(value)
}
