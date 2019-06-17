const racingSetting = [
  {
    'label': '冠军',
    'key': '1'
  }, {
    'label': '亚军',
    'key': '2'
  }, {
    'label': '第三名',
    'key': '3'
  }, {
    'label': '第四名',
    'key': '4'
  }, {
    'label': '第五名',
    'key': '5'
  }, {
    'label': '第六名',
    'key': '6'
  }, {
    'label': '第七名',
    'key': '7'
  }, {
    'label': '第八名',
    'key': '8'
  }, {
    'label': '第九名',
    'key': '9'
  }, {
    'label': '第十名',
    'key': '10'
  }]

const sscSetting = [
  {
    label: '第一球',
    key: '1'
  },
  {
    label: '第二球',
    key: '2'
  },
  {
    label: '第三球',
    key: '3'
  },
  {
    label: '第四球',
    key: '4'
  },
  {
    label: '第五球',
    key: '5'
  }
]

export const setting = {
  bcr: racingSetting,
  jspk10: racingSetting,
  cs60cr: racingSetting,
  mlaft: racingSetting,

  jsssc: sscSetting,
  cqssc: sscSetting
}

export const schemeTypeList = [
  { key: 'FIVE_NUM_FOR_SINGLE', label: '单期5码', type: 1 },
  { key: 'SIX_NUM_FOR_SINGLE', label: '单期6码', type: 1 },
  { key: 'FIVE_NUM_FOR_TRIPLE', label: '3期5码', type: 3 },
  { key: 'SIX_NUM_FOR_DOUBLE', label: '2期6码', type: 2 }
]

export const hasExpertPlan = function (code) {
  return !!setting[code]
}
