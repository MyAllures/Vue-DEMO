
const customPlayGroups = [
  {
    // 重庆幸运农场 连码, 广东快乐十分 连码
    code: ['cqlf_pg_wc_wc', 'gdklsf_pg_wc_wc'],
    component: 'common',
    options: Array.from(Array(20).keys()).map(item => item + 1),
    cols: 5
  },
  {
    // 广东11选5 直选, 安徽11选5 直选, 北京11选5 直选, 福建11选5 直选, 乾漱11选5 直选
    code: ['gd11x5_pg_seq_seq', 'ah11x5_pg_seq_seq', 'bj11x5_pg_seq_seq', 'fj11x5_pg_seq_seq', 'gs11x5_pg_seq_seq'],
    component: 'gd11x5Seq',
    options: Array.from(Array(11).keys()),
    cols: 6
  },
  {
    // 广东11选5 连码, 安徽11选5 连码, 北京11选5 连码, 福建11选5 连码, 乾漱11选5 连码
    code: ['gd11x5_pg_wc_wc', 'ah11x5_pg_wc_wc', 'bj11x5_pg_wc_wc', 'fj11x5_pg_wc_wc', 'gs11x5_pg_wc_wc'],
    component: 'common',
    options: Array.from(Array(11).keys()),
    cols: 6,
    transpose: true
  },
  {
    // 六合彩 合肖
    code: ['hkl_pg_shxiao_spczdc', 'luckl_pg_shxiao_spczdc', 'cshkl_pg_shxiao_spczdc', 'cs600hkl_pg_shxiao_spczdc', 'csjndhkl_pg_shxiao_spczdc', 'cs75hkl_pg_shxiao_spczdc'],
    component: 'hklPgShxiaoSpczdc',
    options: Array.from(Array(12).keys()).map(item => item + 1),
    cols: 2
  },
  {
    // 六合彩 连码
    code: ['hkl_pg_withcode', 'luckl_pg_withcode', 'cshkl_pg_withcode', 'cs600hkl_pg_withcode', 'csjndhkl_pg_withcode', 'cs75hkl_pg_withcode'],
    component: 'common',
    options: Array.from(Array(49).keys()).map(item => item + 1),
    cols: 7
  },
  {
    // 六合彩 二连肖
    code: ['hkl_pg_exlzdc2', 'luckl_pg_exlzdc2', 'cshkl_pg_exlzdc2', 'cs600hkl_pg_exlzdc2', 'csjndhkl_pg_exlzdc2', 'cs75hkl_pg_exlzdc2'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 三连肖
    code: ['hkl_pg_exlzdc3', 'luckl_pg_exlzdc3', 'cshkl_pg_exlzdc3', 'cs600hkl_pg_exlzdc3', 'csjndhkl_pg_exlzdc3', 'cs75hkl_pg_exlzdc3'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 四连肖
    code: ['hkl_pg_exlzdc4', 'luckl_pg_exlzdc4', 'cshkl_pg_exlzdc4', 'cs600hkl_pg_exlzdc4', 'csjndhkl_pg_exlzdc4', 'cs75hkl_pg_exlzdc4'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 五连肖
    code: ['hkl_pg_exlzdc5', 'luckl_pg_exlzdc5', 'cshkl_pg_exlzdc5', 'cs600hkl_pg_exlzdc5', 'csjndhkl_pg_exlzdc5', 'cs75hkl_pg_exlzdc5'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 二连尾
    code: ['hkl_pg_exltail2', 'luckl_pg_exltail2', 'cshkl_pg_exltail2', 'cs600hkl_pg_exltail2', 'csjndhkl_pg_exltail2', 'cs75hkl_pg_exltail2'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 三连尾
    code: ['hkl_pg_exltail3', 'luckl_pg_exltail3', 'cshkl_pg_exltail3', 'cs600hkl_pg_exltail3', 'csjndhkl_pg_exltail3', 'cs75hkl_pg_exltail3'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 四连尾
    code: ['hkl_pg_exltail4', 'luckl_pg_exltail4', 'cshkl_pg_exltail4', 'cs600hkl_pg_exltail4', 'csjndhkl_pg_exltail4', 'cs75hkl_pg_exltail4'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 五连尾
    code: ['hkl_pg_exltail5', 'luckl_pg_exltail5', 'cshkl_pg_exltail5', 'cs600hkl_pg_exltail5', 'csjndhkl_pg_exltail5', 'cs75hkl_pg_exltail5'],
    component: 'hklPgExl',
    cols: 2
  },
  {
    // 六合彩 自选不中
    code: ['hkl_pg_ntinfvr_num', 'luckl_pg_ntinfvr_num', 'cshkl_pg_ntinfvr_num', 'cs600hkl_pg_ntinfvr_num', 'csjndhkl_pg_ntinfvr_num', 'cs75hkl_pg_ntinfvr_num'],
    component: 'hklPgNtinfvrNum',
    options: Array.from(Array(49).keys()).map(item => item + 1),
    cols: 7
  },
  {
    // 福彩3D 二字定位
    code: ['fc3d_pg_2df'],
    component: 'fc3dPg2df',
    options: Array.from(Array(10).keys()).map(item => item),
    cols: 5
  },
  {
    // 福彩3D 三字定位
    code: ['fc3d_pg_3df'],
    component: 'fc3dPg2df',
    options: Array.from(Array(10).keys()).map(item => item),
    cols: 5
  },
  {
    // 福彩3D 组选三
    code: ['fc3d_pg_pic'],
    component: 'fc3dPgIc',
    options: Array.from(Array(10).keys()),
    cols: 2
  },
  {
    // 福彩3D 组选六
    code: ['fc3d_pg_msic'],
    component: 'fc3dPgIc',
    options: Array.from(Array(10).keys()),
    cols: 2
  }
]

export default customPlayGroups
