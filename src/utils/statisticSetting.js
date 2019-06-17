const sscDataSetting = {
  '1': {
    subCategories: ['dragon_tiger_1_5', 'ball_than_size_1', 'ball_odd_even_1']
  },
  '2': {
    subCategories: ['ball_than_size_2', 'ball_odd_even_2']
  },
  '3': {
    subCategories: ['ball_than_size_3', 'ball_odd_even_3']
  },
  '4': {
    subCategories: ['ball_than_size_4', 'ball_odd_even_4']
  },
  '5': {
    subCategories: ['ball_than_size_5', 'ball_odd_even_5']
  },
  'sum_of_ball': {
    subCategories: ['sum_of_ball_than_size', 'sum_of_ball_odd_even']
  }
}

const racingDataSetting = {
  '1': {
    subCategories: ['dragon_tiger_1_10', 'ball_than_size_1', 'ball_odd_even_1']
  },
  '2': {
    subCategories: ['dragon_tiger_2_9', 'ball_than_size_2', 'ball_odd_even_2']
  },
  '3': {
    subCategories: ['dragon_tiger_3_8', 'ball_than_size_3', 'ball_odd_even_3']
  },
  '4': {
    subCategories: ['dragon_tiger_4_7', 'ball_than_size_4', 'ball_odd_even_4']
  },
  '5': {
    subCategories: ['dragon_tiger_5_6', 'ball_than_size_5', 'ball_odd_even_5']
  },
  '6': {
    subCategories: ['ball_than_size_6', 'ball_odd_even_6']
  },
  '7': {
    subCategories: ['ball_than_size_7', 'ball_odd_even_7']
  },
  '8': {
    subCategories: ['ball_than_size_8', 'ball_odd_even_8']
  },
  '9': {
    subCategories: ['ball_than_size_9', 'ball_odd_even_9']
  },
  '10': {
    subCategories: ['ball_than_size_10', 'ball_odd_even_10']
  },
  'sum_of_1st_2st': {
    subCategories: [ 'sum_of_1st_2st_than_size', 'sum_of_1st_2st_odd_even' ]
  }
}

const gd11x5DataSetting = {
  '1': {
    subCategories: ['dragon_tiger_1_5', 'ball_than_size_1', 'ball_odd_even_1']
  },
  '2': {
    subCategories: ['ball_than_size_2', 'ball_odd_even_2']
  },
  '3': {
    subCategories: ['ball_than_size_3', 'ball_odd_even_3']
  },
  '4': {
    subCategories: ['ball_than_size_4', 'ball_odd_even_4']
  },
  '5': {
    subCategories: ['ball_than_size_5', 'ball_odd_even_5']
  },
  'sum_of_ball': {
    subCategories: ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_tail_than_size']
  }
}

const gdklsfDataSetting = {
  '1': {
    subCategories: ['ball_of_sum_number_odd_even_1', 'ball_tail_than_size_1', 'dragon_tiger_1_8', 'ball_odd_even_1', 'ball_than_size_1']
  },
  '2': {
    subCategories: ['ball_of_sum_number_odd_even_2', 'ball_tail_than_size_2', 'dragon_tiger_2_7', 'ball_odd_even_2', 'ball_than_size_2']
  },
  '3': {
    subCategories: ['ball_of_sum_number_odd_even_3', 'ball_tail_than_size_3', 'dragon_tiger_3_6', 'ball_odd_even_3', 'ball_than_size_3']
  },
  '4': {
    subCategories: ['ball_of_sum_number_odd_even_4', 'ball_tail_than_size_4', 'dragon_tiger_4_5', 'ball_odd_even_4', 'ball_than_size_4']
  },
  '5': {
    subCategories: ['ball_of_sum_number_odd_even_5', 'ball_tail_than_size_5', 'ball_odd_even_5', 'ball_than_size_5']
  },
  '6': {
    subCategories: ['ball_of_sum_number_odd_even_6', 'ball_tail_than_size_6', 'ball_odd_even_6', 'ball_than_size_6']
  },
  '7': {
    subCategories: ['ball_of_sum_number_odd_even_7', 'ball_tail_than_size_7', 'ball_odd_even_7', 'ball_than_size_7']
  },
  '8': {
    subCategories: ['ball_of_sum_number_odd_even_8', 'ball_tail_than_size_8', 'ball_odd_even_8', 'ball_than_size_8']
  },
  'sum_of_ball': {
    subCategories: ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_tail_than_size']
  }
}

const k3DataSetting = {
  'sum_of_ball': { // 和值
    subCategories: ['sum_of_ball_odd_even', 'sum_of_ball_than_size']
  },
  'balls_max_diff': { // 跨度
    subCategories: ['balls_max_diff_odd_even', 'balls_max_diff_than_size']
  },
  'sum_of_ball_tail': { // 牌點
    subCategories: ['sum_of_ball_tail_odd_even', 'sum_of_ball_tail_than_size']
  }
}

const ddDataSetting = {
  'noDataSetting': {
    subCategories: ['sum_of_ball_odd_even', 'sum_of_ball_than_size', 'sum_of_ball_color_wavelength']
  }
}

const kl8DataSetting = {
  'noDataSetting': {
    subCategories: ['balls_front_rear_count_cp', 'sum_of_ball_five_element', 'balls_odd_even_cp', 'sum_of_ball_odd_even', 'sum_of_ball_than_size']
  }
}

const auluck8DataSetting = {
  'noDataSetting': {
    subCategories: ['sum_of_ball_five_element', 'sum_of_ball_odd_even', 'sum_of_ball_than_size']
  }
}

export const ROADS = {
  daRoad: 'daRoad',
  jupanRoad: 'jupanRoad',
  littleRoad: 'littleRoad',
  bigeyeRoad: 'bigeyeRoad',
  beetleRoad: 'beetleRoad'
}

export const statisticMap = {
  bcr: racingDataSetting,
  cs60cr: racingDataSetting,
  jspk10: racingDataSetting,
  er75ft: racingDataSetting,
  mlaft: racingDataSetting,
  cs600cr: racingDataSetting,
  jsssc: sscDataSetting,
  cqssc: sscDataSetting,
  xjssc: sscDataSetting,
  tjssc: sscDataSetting,
  ynssc: sscDataSetting,
  hjssc: sscDataSetting,
  csffc: sscDataSetting,
  cs10fc: sscDataSetting,
  cs5fc: sscDataSetting,
  gd11x5: gd11x5DataSetting,
  ah11x5: gd11x5DataSetting,
  bj11x5: gd11x5DataSetting,
  fj11x5: gd11x5DataSetting,
  gs11x5: gd11x5DataSetting,
  gdklsf: gdklsfDataSetting,
  jsk3: k3DataSetting,
  msk3: k3DataSetting,
  bjk3: k3DataSetting,
  gxk3: k3DataSetting,
  shk3: k3DataSetting,
  hubk3: k3DataSetting,
  gzk3: k3DataSetting,
  hbk3: k3DataSetting,
  gsk3: k3DataSetting,
  bjkl8: kl8DataSetting,
  auluck8: auluck8DataSetting,
  pcdd: ddDataSetting,
  jnd28: ddDataSetting,
  luckdd: ddDataSetting,
  msdd: ddDataSetting
}

export const xiaSanRoadGames = ['bcr', 'cs60cr', 'jspk10', 'er75ft', 'mlaft', 'jsssc', 'cqssc', 'xjssc', 'tjssc', 'ynssc', 'hjssc', 'csffc', 'cs600cr', 'cs5fc', 'cs10fc']

export const CUMULATIVE_KEYS = [
  ['outOfDefinition'],
  ['dragon', 'bigger', 'odd', 'gold', 'front_part_more', 'red'],
  ['tiger', 'smaller', 'even', 'wood', 'rear_part_more', 'blue'],
  ['equal', 'water', 'green'],
  ['fire'],
  ['earth']
]
