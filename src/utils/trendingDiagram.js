const OPTIONS = {
  racing: {
    position: [
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
      }],
    number: [
      {
        'label': '号码 1',
        'key': '1'
      }, {
        'label': '号码 2',
        'key': '2'
      }, {
        'label': '号码 3',
        'key': '3'
      }, {
        'label': '号码 4',
        'key': '4'
      }, {
        'label': '号码 5',
        'key': '5'
      }, {
        'label': '号码 6',
        'key': '6'
      }, {
        'label': '号码 7',
        'key': '7'
      }, {
        'label': '号码 8',
        'key': '8'
      }, {
        'label': '号码 9',
        'key': '9'
      }, {
        'label': '号码 10',
        'key': '10'
      }]
  },
  ssc: {
    position: [
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
  },
  dd: {
    position: [
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
      }
    ]
  },
  gdklsf: {
    position: [
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
      },
      {
        label: '第六球',
        key: '6'
      },
      {
        label: '第七球',
        key: '7'
      },
      {
        label: '第八球',
        key: '8'
      }
    ]
  },
  gd11x5: {
    position: [
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
  },
  k3: {
    sum: []
  }
}

const getPositionTable = (options) => {
  return (label) => {
    const numberCols = options.map((option, index) => {
      return {
        key: 'numbers',
        label: option,
        isDynamicWidth: true,
        width: options.length
      }
    })
    return {
      numbers: {
        subCols: numberCols,
        label: `${label} 走势`,
        rowspan: 1,
        colspan: options.length
      },
      hueBai: {
        subCols: [
          { label: '反向', key: 'backward' },
          { label: '重号', key: 'repeat' },
          { label: '正向', key: 'forward' }
        ],
        label: '回摆',
        rowspan: 1,
        colspan: 3,
        tip: true
      },
      danSuan: {
        subCols: [
          { label: '单', key: 'odd' },
          { label: '双', key: 'even' }
        ],
        label: '单双',
        rowspan: 1,
        colspan: 2
      },
      daSiao: {
        subCols: [
          { label: '大', key: 'bigger' },
          { label: '小', key: 'small' }
        ],
        label: '大小',
        rowspan: 1,
        colspan: 2
      }
    }
  }
}

const getNumberTable = (options) => {
  return (label) => {
    const numberCols = options.map((option, index) => {
      return {
        key: 'numbers',
        label: option,
        isDynamicWidth: true
      }
    })
    return {
      numbers: {
        subCols: numberCols,
        label: `${label} 走势`,
        rowspan: 1,
        colspan: options.length
      },
      hueBai: {
        subCols: [
          { label: '反向', key: 'backward' },
          { label: '重号', key: 'repeat' },
          { label: '正向', key: 'forward' }
        ],
        label: '回摆',
        rowspan: 1,
        colspan: 3,
        tip: true
      },
      chiangHou: {
        subCols: [
          { label: '前', key: 'front' },
          { label: '后', key: 'behind' }
        ],
        label: '前后',
        rowspan: 1,
        colspan: 2
      }
    }
  }
}

const getSumTable = (options) => {
  return (label) => {
    const numberCols = options.map((option, index) => {
      return {
        key: 'numbers',
        label: option,
        isDynamicWidth: true
      }
    })
    return {
      numbers: {
        subCols: numberCols,
        label: `${label} 走势`,
        rowspan: 1,
        colspan: options.length
      },
      hueBai: {
        subCols: [
          { label: '反向', key: 'backward' },
          { label: '重号', key: 'repeat' },
          { label: '正向', key: 'forward' }
        ],
        label: '回摆',
        rowspan: 1,
        colspan: 3,
        tip: true
      },
      danSuan: {
        subCols: [
          { label: '单', key: 'odd' },
          { label: '双', key: 'even' }
        ],
        label: '单双',
        rowspan: 1,
        colspan: 2
      },
      daSiao: {
        subCols: [
          { label: '大', key: 'bigger' },
          { label: '小', key: 'small' }
        ],
        label: '大小',
        rowspan: 1,
        colspan: 2
      }
    }
  }
}

const TRENDING_TYPES = {
  'position': {
    label: '位置走势',
    name: 'trending_position'
  },
  'number': {
    label: '号码走势',
    name: 'trending_number'
  },
  'sum': {
    label: '总和走势',
    name: 'trending_sum'
  }
}

export const GAMES_TYPES_MAP = {
  jspk10: [TRENDING_TYPES.position, TRENDING_TYPES.number],
  bcr: [TRENDING_TYPES.position, TRENDING_TYPES.number],
  er75ft: [TRENDING_TYPES.position, TRENDING_TYPES.number],
  mlaft: [TRENDING_TYPES.position, TRENDING_TYPES.number],
  cs600cr: [TRENDING_TYPES.position, TRENDING_TYPES.number],
  cs60cr: [TRENDING_TYPES.position, TRENDING_TYPES.number],
  jsssc: [TRENDING_TYPES.position],
  cqssc: [TRENDING_TYPES.position],
  xjssc: [TRENDING_TYPES.position],
  tjssc: [TRENDING_TYPES.position],
  ynssc: [TRENDING_TYPES.position],
  hjssc: [TRENDING_TYPES.position],
  csffc: [TRENDING_TYPES.position],
  cs5fc: [TRENDING_TYPES.position],
  cs10fc: [TRENDING_TYPES.position],
  pcdd: [TRENDING_TYPES.position],
  jnd28: [TRENDING_TYPES.position],
  luckdd: [TRENDING_TYPES.position],
  msdd: [TRENDING_TYPES.position],
  gdklsf: [TRENDING_TYPES.position],
  gd11x5: [TRENDING_TYPES.position],
  ah11x5: [TRENDING_TYPES.position],
  bj11x5: [TRENDING_TYPES.position],
  fj11x5: [TRENDING_TYPES.position],
  gs11x5: [TRENDING_TYPES.position],
  msk3: [TRENDING_TYPES.sum],
  jsk3: [TRENDING_TYPES.sum],
  bjk3: [TRENDING_TYPES.sum],
  gxk3: [TRENDING_TYPES.sum],
  shk3: [TRENDING_TYPES.sum],
  hubk3: [TRENDING_TYPES.sum],
  gzk3: [TRENDING_TYPES.sum],
  hbk3: [TRENDING_TYPES.sum],
  gsk3: [TRENDING_TYPES.sum]
}

export const GAMES_CHART_MAP = {
  jspk10: {
    options: {
      position: OPTIONS['racing'].position,
      number: OPTIONS['racing'].number
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      number: getNumberTable(['冠', '亞', '三', '四', '五', '六', '七', '八', '九', '十'])
    }
  },
  bcr: {
    options: {
      position: OPTIONS['racing'].position,
      number: OPTIONS['racing'].number
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      number: getNumberTable(['冠', '亞', '三', '四', '五', '六', '七', '八', '九', '十'])
    }
  },
  er75ft: {
    options: {
      position: OPTIONS['racing'].position,
      number: OPTIONS['racing'].number
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      number: getNumberTable(['冠', '亞', '三', '四', '五', '六', '七', '八', '九', '十'])
    }
  },
  mlaft: {
    options: {
      position: OPTIONS['racing'].position,
      number: OPTIONS['racing'].number
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      number: getNumberTable(['冠', '亞', '三', '四', '五', '六', '七', '八', '九', '十'])
    }
  },
  cs600cr: {
    options: {
      position: OPTIONS['racing'].position,
      number: OPTIONS['racing'].number
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      number: getNumberTable(['冠', '亞', '三', '四', '五', '六', '七', '八', '九', '十'])
    }
  },
  cs60cr: {
    options: {
      position: OPTIONS['racing'].position,
      number: OPTIONS['racing'].number
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      number: getNumberTable(['冠', '亞', '三', '四', '五', '六', '七', '八', '九', '十'])
    }
  },
  jsssc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  cqssc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  xjssc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  tjssc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  ynssc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  hjssc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  csffc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  cs5fc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  cs10fc: {
    options: {
      position: OPTIONS['ssc'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  pcdd: {
    options: {
      position: OPTIONS['dd'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  jnd28: {
    options: {
      position: OPTIONS['dd'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  msdd: {
    options: {
      position: OPTIONS['dd'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  luckdd: {
    options: {
      position: OPTIONS['dd'].position
    },
    table: {
      position: getPositionTable(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])
    }
  },
  gdklsf: {
    options: {
      position: OPTIONS['gdklsf'].position
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'])
    }
  },
  gd11x5: {
    options: {
      position: OPTIONS['gd11x5'].position
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
    }
  },
  ah11x5: {
    options: {
      position: OPTIONS['gd11x5'].position
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
    }
  },
  bj11x5: {
    options: {
      position: OPTIONS['gd11x5'].position
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
    }
  },
  fj11x5: {
    options: {
      position: OPTIONS['gd11x5'].position
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
    }
  },
  gs11x5: {
    options: {
      position: OPTIONS['gd11x5'].position
    },
    table: {
      position: getPositionTable(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
    }
  },
  msk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  jsk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  bjk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  gxk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  shk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  hubk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  gzk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  hbk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  },
  gsk3: {
    options: {
      sum: OPTIONS['k3'].sum
    },
    table: {
      sum: getSumTable(['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'])
    }
  }
}
