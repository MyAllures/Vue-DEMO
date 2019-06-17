// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import VueCookie from 'vue-cookie'
import VueI18n from 'vue-i18n'
import locales from './i18n/locales'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vue2Filters from 'vue2-filters'
import { axiosGhost, axiosEagle, axiosVenom, gethomePage, setCookie, fetchPaymentType, sendHeartBeat, fetchJWTToken, fetchServiceUnread } from './api'
import qs from 'qs'
import sign from './utils/sign'
import directive from 'element-ui/packages/popover/src/directive'
import urls from './api/urls'
import { HTTP_ERROR, JS_ERROR, AUTH_ERROR, report } from './report'
import './utils/icon'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import GhostSocketObj from '@/ws/eider'
import Identity from '@/config/Identity'
import {getJWTToken} from './utils'
Vue.component(VueQrcode.name, VueQrcode)

const sendGaEvent = ({label = '', category = '', action = ''}) => {
  if (store.state.systemConfig.gaTrackingId) {
    window.gtag('event', action, {'event_category': category, 'event_label': label})
  }
}

let serviceUnreadInterval = null

const pollServiceUnread = () => {
  const getUnread = () => {
    if (router.history.current.query.service === 'on') return
    fetchServiceUnread().then(res => {
      store.dispatch('customerService/setServiceUnread', res.has_unread)
    }).catch(e => {
      clearInterval(serviceUnreadInterval)
    })
  }
  serviceUnreadInterval = setInterval(() => {
    getUnread()
  }, 30000)
}

window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
  report({
    type: JS_ERROR,
    error
  })
  throw error
}
Vue.config.errorHandler = (error, vm, info) => {
  report({
    type: JS_ERROR,
    error,
    memo: info
  })
  throw error
}

Vue.directive('popover', directive)

let url = window.location.href
const HTTPS = process.env.HTTPS
if (HTTPS && HTTPS.replace(/"/g, '') === '1') {
  if (window.location.protocol === 'http:') {
    window.location.replace(url.replace(/http:/, 'https:'))
  }
}

let search = url.match(/\?([^/#]*)/)
const params = search ? qs.parse(search[1]) : {}
if (params.r) {
  setCookie('r=' + params.r).catch(() => {})
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueI18n)
Vue.use(ElementUI, { size: 'small' })

Vue.use(VueCookie)
Vue.use(Vuex)

Vue.config.productionTip = false

const i18n = new VueI18n({
  locale: 'cn',
  messages: locales
})

if (params.f) {
  Vue.cookie.set('referral_id', params.f)
}

const toHomeAndLogin = function (router) {
  store.dispatch('resetUser')
  router.push({
    path: '/',
    query: {
      login: 1,
      next: router.path
    }
  })

  store.commit('SHOW_LOGIN_DIALOG')
}

// axios config
axiosGhost.interceptors.request.use((config) => {
  if (params.r) {
    config.headers.common['x-r'] = params.r
  }
  if (config.url.indexOf('v2') !== -1) {
    let t = new Date()
    config.headers.common['x-sign'] = sign.ink(t)
    config.headers.common['x-date'] = sign.blot(t)
  }
  let token = Vue.cookie.get('access_token')
  if (token) {
    config.headers.common['Authorization'] = 'Bearer ' + token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

const pollingApi = [urls.game_result]
axiosGhost.interceptors.response.use(res => {
  let responseData = res.data
  const fromVenom = res.config.url.includes(urls.venomHost)
  if (fromVenom) {
    return responseData
  }
  if (responseData.code === 2000) {
    return responseData.data
  } else if (responseData.code === 9001) {
    return responseData
  } else {
    if (responseData.code === 9007) {
      if (!pollingApi.some(url => res.config.url.indexOf(url) !== -1)) { // 忽略輪詢api
        report({
          type: AUTH_ERROR,
          url: res.config.url,
          msg: '9007身份认证信息未提供'
        })
        toHomeAndLogin(router)
      }
    }
    return Promise.reject(responseData)
  }
}, (error) => {
  report({
    type: HTTP_ERROR,
    error
  })
  // Vue.prototype.$message({
  //   showClose: true,
  //   message: '网路服务异常，请稍后再试',
  //   type: 'error'
  // })
  return Promise.reject(error)
})

axiosEagle.interceptors.request.use((config) => {
  let token = store.state.token.eagle
  if (token) {
    config.headers.common['Authorization'] = 'JWT ' + token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

axiosEagle.interceptors.response.use(res => {
  return res.data
}, (error) => {
  report({
    type: HTTP_ERROR,
    error
  })
  return Promise.reject(error.response)
})

axiosVenom.interceptors.request.use((config) => {
  let token = store.state.token.venom
  if (token) {
    config.headers.common['Authorization'] = 'JWT ' + token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

axiosVenom.interceptors.response.use(res => {
  return res.data
}, (error) => {
  report({
    type: HTTP_ERROR,
    error
  })
  return Promise.reject(error.response)
})

// router config
router.beforeEach((to, from, next) => {
  // fisrMacthed might be the top-level parent route of others
  const firstMatched = to.matched.length ? to.matched[0] : null
  if ((firstMatched || to).meta.requiresAuth) {
    if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
      next()
    } else {
      const user = store.state.user
      if (user.logined === 'pending') {
        const unwatch = store.watch((state) => {
          return state.user.logined
        }, (logined) => {
          unwatch()
          if (logined) {
            next()
          } else {
            toHomeAndLogin(router)
          }
        })
      } else if (user.logined === true) {
        if (user.account_type === 0 && to.matched[0].path === '/account') {
          toHomeAndLogin(router)
        } else {
          next()
        }
      } else {
        toHomeAndLogin(router)
      }
    }
  } else {
    next()
  }
})

router.afterEach(function (to) {
  const gaTrackingId = store.state.systemConfig.gaTrackingId
  if (gaTrackingId && to.meta.gaTitle !== 'custom') {
    window.gtag('config', store.state.systemConfig.gaTrackingId, {page_path: to.path, page_title: to.meta.gaTitle})
  }
})

sync(store, router)

Vue.mixin({
  methods: {
    performLogin () {
      toHomeAndLogin(this.$router)
    },
    clearSpace (form, key) {
      form[key] = form[key].replace(/\s+/g, '')
    },
    sendGaEvent ({label = '', category = '', action = ''}) {
      sendGaEvent({label, category, action})
    }
  }
})

// set theme
let theme = store.state.systemConfig.theme
document.body.classList.add(theme)

// init data
function initData () {
  store.dispatch('fetchGames')
  store.dispatch('fetchAnnouncement')
  store.dispatch('fetchBanner')
  store.dispatch('fetchDescription')
  store.dispatch('chatroom/roomList').catch(() => {})

  gethomePage().then(
    response => {
      let pref = response.global_preferences || {}
      let newTheme
      let newThemeColor
      switch (response.theme) {
        case 2:
          newThemeColor = '#1976d2'
          newTheme = 'blue-theme'
          break
        case 3:
          newThemeColor = '#dd603a'
          newTheme = 'orange-theme'
          break
        case 4:
          newThemeColor = '#53b8df'
          newTheme = 'green-theme'
          break
        case 5:
          newThemeColor = '#6a42a6'
          newTheme = 'purple-theme'
          break
        default:
          newThemeColor = '#1976d2'
          newTheme = 'default-theme'
      }

      let localTheme = store.state.systemConfig.theme
      let localThemeColor = store.state.systemConfig.themeColor

      if ((newTheme !== localTheme) || (newThemeColor !== localThemeColor)) { // 表示主題修改過，應套用新版
        document.body.classList.remove(localTheme)
        document.body.classList.add(newTheme)
        localStorage.setItem('theme', newTheme)
        localStorage.setItem('themeColor', newThemeColor)
        localTheme = newTheme
        localThemeColor = newThemeColor
      }
      const customerServiceUrl = pref.customer_service_url
      const enableBuiltInCustomerService = pref.enable_built_in_customer_service === 'true'
      let serviceAction = null
      if (enableBuiltInCustomerService) {
        serviceAction = () => {
          sendGaEvent({label: '我的', category: '點擊/進入客服', action: '點擊'})
          router.push({query: {'service': 'on'}})
        }
      } else {
        if (customerServiceUrl) {
          serviceAction = () => { window.open(customerServiceUrl) }
        }
      }

      store.dispatch('actv2/setActEnabled', {
        boost: response.engagement_boost_activity_enabled,
        referral: response.referral_activity_enabled
      })

      store.dispatch('setSystemConfig',
        {
          state: 'fulfilled',
          serviceAction,
          isAdvanced: !!response.is_advanced,
          homePageLogo: response.icon,
          agentDashboardUrl: pref.agent_dashboard_url,
          global_preferences: pref,
          agentBusinessConsultingQQ: response.agent_business_consulting_qq,
          contactEmail: response.contact_email,
          contactPhoneNumber: response.contact_phone_number,
          openAccountConsultingQQ: response.open_account_consulting_qq,
          siteName: response.name,
          floatAd: response.right_float_img,
          gaTrackingId: pref.ga_tracking_id,
          favicon: response.favicon,
          regPresentAmount: response.reg_present_amount,
          needBankinfo: response.need_bankinfo,
          chatroomEnvelopeSettings: pref.chatroom_red_envelope_eagle || {},
          mobileLinkUrl: pref.mobile_link_url,
          smsValidationEnabled: pref.sms_validation_enabled,
          planSiteSetting: {
            host: pref.plan_site_url || '',
            games: ['bcr', 'cqssc', 'jsssc', 'jspk10', 'mlaft']
          },
          envelopeActivityId: response.envelope_activity_id || null,
          theme: localTheme,
          themeColor: localThemeColor,
          appDownloadUrl: pref.app_download_url,
          enableBuiltInCustomerService: pref.enable_built_in_customer_service === 'true'
        })
      if (pref.ga_tracking_id) {
        let gaScript = document.getElementById('ga-script')
        if (!gaScript) {
          const ga = document.createElement('script')
          ga.type = 'text/javascript'
          ga.id = 'ga-script'
          ga.async = true
          ga.src = `https://www.googletagmanager.com/gtag/js?id=${pref.ga_tracking_id}`
          const s = document.getElementsByTagName('script')[0]
          s.parentNode.insertBefore(ga, s)
        }
      }
      if (pref.script_content) {
        let customScript = document.getElementById('custom-script')
        if (customScript) {
          customScript.parentNode.removeChild(customScript)
        }
        const dynamicScript = document.createElement('script')
        dynamicScript.id = 'custom-script'
        dynamicScript.type = 'text/javascript'
        dynamicScript.async = true
        dynamicScript.text = `try{${pref.script_content}}catch(e){console.log(e)}`
        const s = document.getElementsByTagName('script')[0]
        s.parentNode.insertBefore(dynamicScript, s)
      }
    }
  )
}

const token = Vue.cookie.get('access_token')
if (token) {
  store.dispatch('fetchUser').then(() => {}).catch(() => { initData() })
} else {
  Vue.nextTick(() => {
    store.dispatch('resetUser')
  })
}

let heartBeatInterval
const setHeartBeatInterval = () => {
  sendHeartBeat().catch(() => {})
  clearInterval(heartBeatInterval)
  heartBeatInterval = setInterval(() => {
    sendHeartBeat().catch(() => {})
  }, 5 * 60 * 1000)
}

initData()

store.watch((state, getters) => getters.userIdentity,
  (identity, oldIdentity) => {
    if (identity === Identity.GUEST) {
      clearInterval(heartBeatInterval)
      clearInterval(serviceUnreadInterval)

      localStorage.removeItem('eagle_setting')
      localStorage.removeItem('eider_setting')

      Vue.cookie.delete('access_token')
      Vue.cookie.delete('refresh_token')
      localStorage.setItem('access_token', '')

      if (oldIdentity !== Identity.TRIAL) {
        store.dispatch('token/clear', 'venom')
        localStorage.removeItem('venom_setting')
        if (store.state.ws.venom) {
          store.state.ws.venom.closeConnect()
          store.dispatch('customerService/clearMessage')
        }
      }

      if (store.state.ws.eider) {
        store.state.ws.eider.closeConnect()
      }

      store.dispatch('customerService/setServiceUnread', false)
      store.commit('RESET_MESSAGE_COUNT')
    }
    if (identity > Identity.LOGINED) {
      setHeartBeatInterval()

      let eagleToken = store.state.token.eagle
      if (!eagleToken) {
        fetchJWTToken('eagle').then(setting => {
          localStorage.setItem('eagle_setting', JSON.stringify(setting))

          store.dispatch('token/addToken', {
            type: 'eagle',
            token: setting.token
          })
        }).catch(() => {})
      }

      let eiderTokenPromise = null
      let eiderToken = getJWTToken('eider')

      if (eiderToken) {
        eiderTokenPromise = Promise.resolve(eiderToken)
      } else {
        eiderTokenPromise = fetchJWTToken('eider').then(setting => {
          localStorage.setItem('eider_setting', JSON.stringify(setting))
          return setting.token
        })
      }

      eiderTokenPromise.then(token => {
        store.dispatch('setWs', { ws: new GhostSocketObj(token), type: 'eider' })
      }).catch(() => {})

      if (identity === Identity.NORMAL) {
        store.dispatch('setMessageCount')

        if (store.state.systemConfig.enableBuiltInCustomerService) {
          if (store.state.ws.venom) {
            store.state.ws.venom.closeConnect()
          }
          store.dispatch('customerService/clearMessage')

          let venomTokenPromise
          let venomToken = store.state.token.venom

          if (venomToken) {
            venomTokenPromise = Promise.resolve(venomToken)
            if (oldIdentity === Identity.GUEST) {
              venomTokenPromise = fetchJWTToken('venom').then(setting => {
                localStorage.setItem('venom_setting', JSON.stringify(setting))
                return setting.token
              }).catch(() => {})
            }
          } else if (!venomToken) {
            venomTokenPromise = fetchJWTToken('venom').then(setting => {
              localStorage.setItem('venom_setting', JSON.stringify(setting))
              return setting.token
            }).catch(() => {})
          }

          venomTokenPromise.then(token => {
            store.dispatch('token/addToken', {
              type: 'venom',
              token: token
            })
            pollServiceUnread()
          }).catch(() => {})
        }

        fetchPaymentType().then(data => {
          store.dispatch('setUser', {
            onlinePaymentTypes: data
          })
        }).catch(() => {
          store.dispatch('setUser', {
            onlinePaymentTypes: []
          })
        })
      }
    }
  }
)

/* eslint-disable no-new */
new Vue({
  i18n,
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
