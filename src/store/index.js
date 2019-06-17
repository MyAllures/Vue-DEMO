import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import { getLastGameData } from '../utils'
import chatroom from './chatroom'
import token from './token'
import customerService from './customerService'
import actv2 from './actv2'
import company from '@/company'
Vue.use(Vuex)

const isDebugMode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebugMode
Vue.config.devtools = isDebugMode

export default new Vuex.Store({
  state: {
    company: company.id,
    user: {
      logined: 'pending',
      account_type: undefined,
      unsettled: 0
    },
    chatRoom: {
      defaultRoom: 100000,
      currentRoom: null,
      roomsStatus: undefined,
      isShowing: false
    },
    loginDialogVisible: false,
    showTrialVerifyDialog: false,
    betRecordDialog: {
      visible: false,
      type: 'trial',
      schedule: null
    },
    games: [],
    gameClassification: null,
    categories: {},
    playGroups: {},
    loading: false,
    messageCount: 0,
    envelopes: {},
    latestResultMap: {},
    urgencySwitchedGame: null,
    notification: [],
    notificationVisible: false,
    ws: {
      venom: null,
      eider: null
    },
    isResultRefreshing: false,
    systemConfig: {
      state: 'pending',
      envelopeActivityId: null,
      serviceAction: null,
      agentDashboardUrl: '',
      homePageLogo: '',
      siteName: '',
      global_preferences: {
        chat_condition_message: ''
      },
      floatAd: null,
      contactPhoneNumber: '',
      openAccountConsultingQQ: '',
      agentBusinessConsultingQQ: '',
      contactEmail: '',
      mobileLinkUrl: '',
      smsValidationEnabled: 'false',
      planSiteSetting: {
        host: '',
        games: []

      },
      theme: localStorage.getItem('theme') || 'default-theme',
      isAdvanced: false
    },
    lastGameData: getLastGameData(),
    bettrackPositions: {},
    balanceDialog: {
      visible: false,
      totalAmount: 0,
      expectedWinAmount: 0
    },
    announcements: [],
    banners: [],
    descriptions: [],
    campaignEnvelope: {
      visible: false,
      id: null
    },
    jwt_token: {
      venom: '',
      raven: '',
      eider: '',
      eagle: ''
    }
  },
  actions,
  mutations,
  getters,
  modules: {
    chatroom,
    customerService,
    actv2,
    token
  }
})
