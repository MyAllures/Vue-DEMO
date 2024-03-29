import {map, flatten} from 'lodash'

const TransformerTable =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '',
          buttons: [
            { displayName: '显示号码', show: 'number' },
            { displayName: '显示大小', show: 'thanSize' },
            { displayName: '显示单双', show: 'oddEven' }
          ]
        },
        {
          displayName: '冠亚和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_1st_2st'
            },
            {
              displayName: '大小',
              key: 'sum_of_1st_2st_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_1st_2st_odd_even'
            }
          ]
        },
        {
          displayName: ' 1 - 5 龙 虎 ',
          subHeads: [
            {
              displayName: '',
              key: 'dragon_tiger_1_10'
            },
            {
              displayName: '',
              key: 'dragon_tiger_2_9'
            },
            {
              displayName: '',
              key: 'dragon_tiger_3_8'
            },
            {
              displayName: '',
              key: 'dragon_tiger_4_7'
            },
            {
              displayName: '',
              key: 'dragon_tiger_5_6'
            }
          ]
        }
      ]

const sscTable =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '',
          buttons: [
            {
              displayName: '显示号码',
              show: 'number'
            },
            {
              displayName: '显示大小',
              show: 'thanSize'
            },
            {
              displayName: '显示单双',
              show: 'oddEven'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            }
          ]
        },
        {
          displayName: '龙虎',
          key: 'dragon_tiger_1_5'
        },
        {
          displayName: '前三',
          key: 'weird_chinese_dice_rules_1_3'
        },
        {
          displayName: '中三',
          key: 'weird_chinese_dice_rules_2_4'
        },
        {
          displayName: '后三',
          key: 'weird_chinese_dice_rules_3_5'
        }
      ]

const cqlfTable =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '',
          buttons: [
            {
              displayName: '号码',
              show: 'number'
            },
            {
              displayName: '大小',
              show: 'thanSize'
            },
            {
              displayName: '单双',
              show: 'oddEven'
            },
            {
              displayName: '尾大小',
              show: 'tailThanSize'
            },
            {
              displayName: '合单双',
              show: 'ballOfSumOddEven'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '尾大小',
              key: 'sum_of_ball_tail_than_size'
            }
          ]
        },
        {
          displayName: '龙虎',
          subHeads: [
            {
              displayName: '',
              key: 'dragon_tiger_1_8'
            },
            {
              displayName: '',
              key: 'dragon_tiger_2_7'
            },
            {
              displayName: '',
              key: 'dragon_tiger_3_6'
            },
            {
              displayName: '',
              key: 'dragon_tiger_4_5'
            }
          ]
        }
      ]

const pcddTable =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '开奖号码',
          key: 'result_str'
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '色波',
              key: 'sum_of_ball_color_wavelength'
            },
            {
              displayName: '极值',
              key: 'sum_of_ball_great_tiny'
            }
          ]
        }
      ]

const jsk3Table =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '开奖号码',
          key: 'result_str'
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            }
          ]
        }
      ]

const gd11x5Table =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '',
          buttons: [
            {
              displayName: '号码',
              show: 'number'
            },
            {
              displayName: '大小',
              show: 'thanSize'
            },
            {
              displayName: '单双',
              show: 'oddEven'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '尾大小',
              key: 'sum_of_ball_tail_than_size'
            }
          ]
        },
        {
          displayName: '龙虎',
          key: 'dragon_tiger_1_5'
        }
      ]

const bjkl8Table =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '开奖号码',
          key: 'result_str'
        },
        {
          displayName: '开奖',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '五行',
              key: 'sum_of_ball_five_element'
            }
          ]
        },
        {
          displayName: '比数量',
          subHeads: [
            {
              displayName: '单双比',
              key: 'balls_odd_even_cp'
            },
            {
              displayName: '前后比',
              key: 'balls_front_rear_count_cp'
            }
          ]
        }
      ]

const hklTable =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '',
          buttons: [
            {
              displayName: '号码',
              show: 'number'
            },
            {
              displayName: '大小',
              show: 'thanSize'
            },
            {
              displayName: '单双',
              show: 'oddEven'
            },
            {
              displayName: '合大小',
              show: 'ballOfSumThanSize'
            },
            {
              displayName: '合单双',
              show: 'ballOfSumOddEven'
            },
            {
              displayName: '尾大小',
              show: 'tailThanSize'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '七色波',
              key: 'seven_color_wavelength'
            }
          ]
        }
      ]

const auluck8Table =
      [
        {
          displayName: '时间',
          key: 'schedule_result'
        },
        {
          displayName: '期数',
          key: 'issue_number'
        },
        {
          displayName: '开奖号码',
          key: 'result_str'
        },
        {
          displayName: '开奖',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '五行',
              key: 'sum_of_ball_five_element'
            }
          ]
        }
      ]
const fc3dTable = [
  {
    displayName: '时间',
    key: 'schedule_result'
  },
  {
    displayName: '期数',
    key: 'issue_number'
  },
  {
    displayName: '开奖号码',
    key: 'result_str'
  },
  {
    displayName: '佰拾个和數',
    key: 'three_balls_sum'
  },
  {
    displayName: '跨度',
    key: 'ball_max_min_diff'
  },
  {
    displayName: '佰大小',
    key: 'ball_than_size_1'
  },
  {
    displayName: '佰单双',
    key: 'ball_odd_even_1'
  },
  {
    displayName: '佰质合',
    key: 'ball_prime_composite_1'
  },
  {
    displayName: '拾大小',
    key: 'ball_than_size_2'
  },
  {
    displayName: '拾单双',
    key: 'ball_odd_even_2'
  },
  {
    displayName: '拾质合',
    key: 'ball_prime_composite_2'
  },
  {
    displayName: '个大小',
    key: 'ball_than_size_3'
  },
  {
    displayName: '个单双',
    key: 'ball_odd_even_3'
  },
  {
    displayName: '个质合',
    key: 'ball_prime_composite_3'
  }
]
const msnnTable =
[
  {
    displayName: '时间',
    key: 'schedule_result'
  },
  {
    displayName: '期数',
    key: 'issue_number'
  },
  {
    displayName: '开奖号码',
    key: 'result_str'
  },
  {
    displayName: '庄闲 (背景有颜色代表闲家赢)',
    subHeads: [
      {
        displayName: '庄',
        key: 'banker'
      },
      {
        displayName: '闲一',
        key: 'player_1'
      },
      {
        displayName: '闲二',
        key: 'player_2'
      },
      {
        displayName: '闲三',
        key: 'player_3'
      },
      {
        displayName: '闲四',
        key: 'player_4'
      },
      {
        displayName: '闲五',
        key: 'player_5'
      }
    ]
  }
]

const TransformerTableGames = ['jspk10', 'bcr', 'mlaft', 'er75ft', 'cs60cr', 'cs600cr']
const sscTableGames = ['cqssc', 'jsssc', 'xjssc', 'tjssc', 'csffc', 'cs10fc', 'cs5fc', 'ynssc', 'hjssc']
const cqlfTableGames = ['cqlf', 'gdklsf']
const jsk3TableGames = ['jsk3', 'msk3', 'bjk3', 'gxk3', 'shk3', 'hubk3', 'gzk3', 'hbk3', 'gsk3']
const pcddTableGames = ['pcdd', 'jnd28', 'luckdd', 'msdd']
const bjkl8TableGames = ['bjkl8']
const auluck8TableGames = ['auluck8']
const hklTableGames = ['hkl', 'luckl', 'cshkl', 'cs600hkl', 'csjndhkl', 'cs75hkl']
const msnnTableGames = ['msnn', 'pk10nn']
const gd11x5TableGames = ['gd11x5', 'ah11x5', 'bj11x5', 'fj11x5', 'gs11x5']
const fc3dTableGames = ['fc3d']

const GAMETABLE_ENUM = {
  1: {
    games: TransformerTableGames,
    table: TransformerTable
  },
  2: {
    games: sscTableGames,
    table: sscTable
  },
  3: {
    games: cqlfTableGames,
    table: cqlfTable
  },
  4: {
    games: jsk3TableGames,
    table: jsk3Table
  },
  5: {
    games: pcddTableGames,
    table: pcddTable
  },
  6: {
    games: bjkl8TableGames,
    table: bjkl8Table
  },
  7: {
    games: auluck8TableGames,
    table: auluck8Table
  },
  8: {
    games: hklTableGames,
    table: hklTable
  },
  9: {
    games: msnnTableGames,
    table: msnnTable
  },
  10: {
    games: gd11x5TableGames,
    table: gd11x5Table
  },
  11: {
    games: fc3dTableGames,
    table: fc3dTable
  }
}

const TableSettings = (games, table) => {
  return map(games, code => { return { code, table } })
}

const gameTable = flatten(map(GAMETABLE_ENUM, value => TableSettings(value.games, value.table)))

const resultFilter = (val) => {
  switch (val) {
    case 'dragon':
      return '龙'
    case 'tiger':
      return '虎'
    case 'bigger':
      return '大'
    case 'smaller':
      return '小'
    case 'great':
      return '极大'
    case 'tiny':
      return '极小'
    case 'outOfDefinition':
      return '无极值'
    case 'odd':
      return '单'
    case 'even':
      return '双'
    case 'straight':
      return '顺子'
    case 'half_straight':
      return '半顺'
    case 'misc_six':
      return '杂六'
    case 'pair':
      return '对子'
    case 'leopard':
      return '豹子'
    case 'blue':
      return '蓝波'
    case 'red':
      return '红波'
    case 'green':
      return '绿波'
    case 'equal':
      return '和'
    case 'gold':
      return '金'
    case 'wood':
      return '木'
    case 'water':
      return '水'
    case 'fire':
      return '火'
    case 'earth':
      return '土'
    case 'front_part_more':
      return '前多'
    case 'rear_part_more':
      return '后多'
    case 'odd_more':
      return '单多'
    case 'even_more':
      return '双多'
    case 'prime':
      return '质'
    case 'composite':
      return '合'
    default:
      return val
  }
}
export default { gameTable, resultFilter }
