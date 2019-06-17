const STATUS_ENUM = {
  available: 'available',
  disabled: 'disabled',
  closed: 'closed',
  ineligible: 'ineligible',
  loading: 'loading',
  already_got: 'already_got',
  grab_failed: 'grab_failed',
  grab_success: 'grab_success',
  failed: 'failed',
  not_yet_started: 'not_yet_started',
  in_maintenance: 'in_maintenance',
  need_login: 'need_login',
  property: {
    disabled: {
      btnLabel: '活动尚未开始',
      btnDisabled: true
    },
    need_register: {
      btnLabel: '请先注册',
      btnDisabled: true
    },
    need_login: {
      btnLabel: '请先登录',
      btnDisabled: true
    },
    ineligible: {
      btnLabel: '未满足领取条件',
      btnDisabled: true
    },
    already_got: {
      btnLabel: '今日已抢到红包，明天再来吧',
      btnDisabled: true
    },
    available: {
      btnLabel: '抢红包',
      btnDisabled: false
    },
    loading: {
      btnLabel: '',
      btnDisabled: false
    },
    grab_success: {
      btnLabel: '确认',
      btnDisabled: false
    },
    grab_failed: {
      btnLabel: '确认',
      btnDisabled: false
    },
    failed: {
      btnLabel: '红包抢完了，明天再来吧',
      btnDisabled: true
    },
    closed: {
      btnLabel: '活动结束了，明天再来吧',
      btnDisabled: true
    },
    in_maintenance: {
      btnLabel: '活动暂时关闭中',
      btnDisabled: true
    },
    not_yet_started: {
      btnLabel: '活动尚未开始',
      btnDisabled: true
    }
  }
}

if (Object.freeze) {
  Object.freeze(STATUS_ENUM)
}

export default { STATUS_ENUM }
