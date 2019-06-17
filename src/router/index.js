import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/screens/Home'

const GameHall = (resolve) => require(['@/screens/GameHall'], resolve)
const Game = (resolve) => require(['@/screens/games/Game'], resolve)
const GameCategory = (resolve) => require(['@/screens/games/GameCategory'], resolve)
// const GamePosition = (resolve) => require(['@/screens/games/GamePosition'], resolve)
const ExpertPlan = (resolve) => require(['@/screens/expertPlan/ExpertPlan'], resolve)
const AgentRegister = (resolve) => require(['@/screens/agent/AgentRegister'], resolve)
const Agent = (resolve) => require(['@/screens/agent/Agent'], resolve)
const Register = (resolve) => require(['@/screens/member/Register'], resolve)
const Account = (resolve) => require(['@/screens/member/Account'], resolve)
const Withdraw = (resolve) => require(['@/screens/member/Withdraw'], resolve)
const OnlinePayment = (resolve) => require(['@/screens/member/OnlinePayment'], resolve)
const OnlinePaymentSuccess = (resolve) => require(['@/screens/member/OnlinePaymentSuccess'], resolve)
const Remit = (resolve) => require(['@/screens/member/Remit'], resolve)

const MyAccount = (resolve) => require(['@/screens/member/MyAccount'], resolve)
const PrimaryInfo = (resolve) => require(['@/screens/member/PrimaryInfo'], resolve)
const Followees = (resolve) => require(['@/screens/member/Followees'], resolve)
const PasswordSetting = (resolve) => require(['@/screens/member/PasswordSetting'], resolve)
const WithdrawPassword = (resolve) => require(['@/screens/member/WithdrawPassword'], resolve)
const BankInfo = (resolve) => require(['@/screens/member/BankInfo'], resolve)

const Referrals = (resolve) => require(['@/screens/member/Referrals'], resolve)

const Finance = (resolve) => require(['@/screens/member/Finance'], resolve)
const TransactionRecord = (resolve) => require(['@/screens/member/TransactionRecord'], resolve)
const BetRecord = (resolve) => require(['@/screens/member/BetRecord'], resolve)
const BetRecordTab = (resolve) => require(['@/screens/member/BetRecordTab'], resolve)
const ReturnRecord = (resolve) => require(['@/screens/member/ReturnRecord'], resolve)
const TrackRecord = (resolve) => require(['@/screens/member/TrackRecord'], resolve)

const PersonalReport = (resolve) => require(['@/screens/member/PersonalReport'], resolve)
const Overview = (resolve) => require(['@/screens/member/Overview'], resolve)

const Message = (resolve) => require(['@/screens/member/Message'], resolve)
const Announcement = (resolve) => require(['@/screens/member/Announcement'], resolve)

const Promotions = (resolve) => require(['@/screens/promotion/Promotions'], resolve)
const Faq = (resolve) => require(['@/screens/faq/FaqsHome'], resolve)
const FaqWithdraw = (resolve) => require(['@/screens/faq/FaqWithdraw'], resolve)
const FaqDeposit = (resolve) => require(['@/screens/faq/FaqDeposit'], resolve)
const FaqAbout = (resolve) => require(['@/screens/faq/FaqAbout'], resolve)
const FaqContact = (resolve) => require(['@/screens/faq/FaqContact'], resolve)
const FaqFaqs = (resolve) => require(['@/screens/faq/FaqFaqs'], resolve)
const Gameintro = (resolve) => require(['@/screens/gameintro/Gameintros'], resolve)
const GameHistory = (resolve) => require(['@/screens/gamehistory/GameHistory'], resolve)
const HistoryTable = (resolve) => require(['@/screens/gamehistory/HistoryTable'], resolve)
const TrendindDiagram = (resolve) => require(['@/screens/gamehistory/TrendindDiagram'], resolve)

Vue.use(Router)

const router = new Router({
  routes: []
})

const baseRoutes = [{
  path: '/',
  name: 'Home',
  component: Home
},
{
  path: '/agent',
  name: 'Agent',
  component: Agent,
  meta: {
    gaTitle: '代理商'
  },
  children: [{
    path: 'agent_register',
    name: 'AgentRegister',
    component: AgentRegister
  }]
},
{
  path: '/register',
  name: 'Register',
  component: Register
},
{
  path: '/game',
  name: 'Game',
  component: GameHall,
  meta: {
    requiresAuth: true
  },
  children: [{
    path: ':gameId',
    component: Game,
    children: [
    // {
    //   path: 'playpositions',
    //   component: GamePosition,
    //   name: 'GamePosition',
    //   meta: {
    //     gaTitle: 'custom'
    //   }
    // },
      {
        path: 'expertplan',
        component: ExpertPlan,
        name: 'ExpertPlan',
        meta: {
          gaTitle: 'custom'
        }
      },
      {
        path: ':categoryId',
        component: GameCategory,
        name: 'GameCategory',
        meta: {
          gaTitle: 'custom'
        }
      }

    ]
  }]
},
{
  path: '/account',
  name: 'Account',
  meta: {
    requiresAuth: true
  },
  component: Account,
  children: [{
    path: 'withdraw',
    name: 'Withdraw',
    component: Withdraw,
    meta: {
      gaTitle: '申请取款'
    }
  },
  {
    path: 'online_payment',
    name: 'OnlinePayment',
    component: OnlinePayment,
    meta: {
      gaTitle: '线上存款'
    }
  },
  {
    path: 'online_payment_success',
    name: 'OnlinePaymentSuccess',
    component: OnlinePaymentSuccess
  },
  {
    path: 'remit',
    name: 'Remit',
    component: Remit,
    meta: {
      gaTitle: '转帐 '
    }
  },
  {
    path: 'referrals',
    name: 'Referrals',
    component: Referrals
  },
  {
    path: 'my',
    name: 'MyAccount',
    component: MyAccount,
    children: [{
      path: 'primary_info',
      name: 'PrimaryInfo',
      component: PrimaryInfo,
      meta: {
        gaTitle: '基本信息'
      }
    },
    {
      path: 'password_setting',
      name: 'PasswordSetting',
      component: PasswordSetting,
      meta: {
        gaTitle: '修改密码'
      }
    },
    {
      path: 'withdraw_password',
      name: 'WithdrawPassword',
      component: WithdrawPassword,
      meta: {
        gaTitle: '修改取款密码'
      }
    },
    {
      path: 'bank_info',
      name: 'BankInfo',
      component: BankInfo,
      meta: {
        gaTitle: '银行资讯'
      }
    }
    ]
  },
  {
    path: 'finance',
    name: 'Finance',
    component: Finance,
    children: [{
      path: 'payment_record',
      name: 'PaymentRecord',
      component: TransactionRecord,
      meta: {
        gaTitle: ' 纪录'
      }
    },
    {
      path: 'withdraw_record',
      name: 'WithdrawRecord',
      component: TransactionRecord,
      meta: {
        gaTitle: '取款纪录'
      }
    },
    {
      path: 'return_record',
      name: 'ReturnRecord',
      component: ReturnRecord,
      meta: {
        gaTitle: '反水纪录'
      }
    },
    {
      path: 'discount_record',
      name: 'DiscountRecord',
      component: TransactionRecord,
      meta: {
        gaTitle: '优惠与红包纪录'
      }
    },
    {
      path: 'track_record',
      name: 'TrackRecord',
      component: TrackRecord,
      meta: {
        gaTitle: '追号纪录'
      }
    }
    ]
  },
  {
    path: 'bet_record',
    name: 'BetRecordTab',
    component: BetRecordTab,
    children: [{
      path: 'settled',
      name: 'SettledBetRecord',
      component: BetRecord,
      meta: {
        gaTitle: '已结注单'
      }
    },
    {
      path: 'unsettled',
      name: 'UnsettledBetRecord',
      component: BetRecord,
      meta: {
        gaTitle: '未结注单'
      }
    }
    ]
  },
  {
    path: 'overview',
    name: 'PersonalOverview',
    component: Overview,
    meta: {
      gaTitle: '个人总览'
    }
  },
  {
    path: 'followees',
    name: 'Followees',
    component: Followees,
    meta: {
      gaTitle: '我的关注'
    }
  },
  {
    path: 'personal_report',
    name: 'PersonalReport',
    component: PersonalReport,
    meta: {
      gaTitle: '个人报表'
    }
  },
  {
    path: 'message',
    name: 'Message',
    component: Message,
    meta: {
      gaTitle: '站内消息'
    }
  },
  {
    path: 'announcement',
    name: 'Announcement',
    component: Announcement,
    meta: {
      gaTitle: '系统公告'
    }
  }
  ]
}, {
  path: '/promotions',
  name: 'Promotions',
  component: Promotions,
  meta: {
    gaTitle: '优惠活动'
  }
}, {
  path: '/faq',
  name: 'Faq',
  component: Faq,
  children: [{
    path: '/faq/deposit',
    name: 'FaqDeposit',
    component: FaqDeposit,
    meta: {
      gaTitle: 'FAQ如何存款'
    }
  }, {
    path: '/faq/withdraw',
    name: 'FaqWithdraw',
    component: FaqWithdraw,
    meta: {
      gaTitle: 'FAQ如何取款'
    }
  }, {
    path: '/faq/faqs',
    name: 'FaqFaqs',
    component: FaqFaqs,
    meta: {
      gaTitle: '常见问题'
    }
  }, {
    path: '/faq/about',
    name: 'FaqAbout',
    component: FaqAbout,
    meta: {
      gaTitle: '关于我们'
    }
  }, {
    path: '/faq/contact',
    name: 'FaqContact',
    component: FaqContact,
    meta: {
      gaTitle: '联系我们'
    }
  }]
},
{
  path: '/gameintro',
  name: 'Gameintro',
  meta: {
    requiresAuth: true,
    gaTitle: '游戏介绍'
  },
  component: Gameintro

},
{
  path: '/gamehistory',
  name: 'GameHistory',
  meta: {
    requiresAuth: true
  },
  component: GameHistory,
  children: [{
    path: ':gameCode/schedules',
    name: 'Schedules',
    meta: {
      requiresAuth: true,
      gaTitle: 'custom'
    },
    component: HistoryTable
  },
  {
    path: ':gameCode/trending_:type',
    name: 'Trending',
    meta: {
      requiresAuth: true,
      gaTitle: 'custom'
    },
    component: TrendindDiagram
  }
  ]
},
{
  path: '*',
  redirect: '/'
}]

router.addRoutes(baseRoutes)

export default router
