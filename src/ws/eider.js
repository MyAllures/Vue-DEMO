import Vue from 'vue'
import store from '@/store'
import router from '@/router'
import urls from '@/api/urls'

const DEBUG = false
const JWT_TYPE = 'eider'
const RETRY_COUNT = 3

function wsDebug (...args) {
  if (process.env.NODE_ENV !== 'development' || !DEBUG) return
  console.warn('[Eider]', ...args)
}

function GhostSocketObj (token) {
  wsDebug('init eider instance')
  this.ws = null
  this.wsConnCheckInterval = null
  this.wsConnTryCount = 0
  this.wsConnCheckTime = 0
  this.pingPongContainer = {}

  this.initWs(token)
}

GhostSocketObj.prototype.initWs = function (token) {
  this.ws = new WebSocket(`${urls.wsEiderHost}/ws?token=${token}`)

  this.ws.onerror = e => {
    wsDebug('ws onerror')
    this.wsConnRetry()
  }

  this.ws.onopen = e => {
    wsDebug('ws onopen')
    clearInterval(this.wsConnCheckInterval)
    this.wsConnCheckTime = 0
    this.pingPongContainer = { ping: 0, pong: 0 }

    this.wsConnCheckInterval = setInterval(() => {
      if (!this.wsConnCheck()) {
        wsDebug('ws check failed')
        this.wsConnRetry()
      }
    }, 3000)
  }

  this.ws.onmessage = response => {
    if (typeof response.data !== 'string') return

    try {
      let data = JSON.parse(response.data)
      switch (data.type) {
        case 'win-notification':
        case 'win-notification-batch':
        case 'bet-track-record':
        case 'bet-track-record-batch':
          store.dispatch('addNotification', data)

          let notificationVisible = store.state.notificationVisible
          if (!notificationVisible) {
            store.commit('SHOW_NOTIFICATION')
          }
          break
        case 'balance-updated':
          store.dispatch('setUser', {
            balance: data.balance
          })
          if (data.to_display) { // 如果 而餘額更新才通知用戶
            Vue.prototype.$message({
              message: '余额已更新',
              type: 'success'
            })
          }
          break
        case 'unsettled-updated':
          store.dispatch('setUser', {
            unsettled: data.unsettled
          })
          break
        // case 'message-count-initial':
        //   store.dispatch('setMessageCount', data.count)
        //   break
        case 'message-count-delta':
          store.dispatch('addMessageCount', data.delta)
          break
        case 'game-result-initial':
          store.dispatch('initLatestResultMap', data.latest_result_map)
          break
        case 'game-result':
          const latestResult = data.latest_result
          const gameCode = data.latest_result.game_code
          let currentGame = store.state.games.find((game) => game.code === latestResult.game_code)
          if (currentGame && router.currentRoute.params.gameId && (router.currentRoute.params.gameId === String(currentGame.id))) {
            store.dispatch('refreshResult')
          }

          latestResult.loading = true
          store.dispatch('updateLatestResultMap', {gameCode, latestResult})

          if (gameCode === 'msnn' || gameCode === 'pk10nn') {
            store.dispatch('stopNiuNiuLoading', gameCode)
          }
          setTimeout(() => {
            latestResult.loading = false
            store.dispatch('updateLatestResultMap', {gameCode, latestResult})
          }, 3000)
          break
        case 'close-time-update':
          store.dispatch('urgencySwitchGame', {
            gameCode: data.game_code,
            issueNumber: data.issue_number,
            closeLeft: data.close_left
          })
          break
        case 'engagement-boost-envelope':
          store.dispatch('actv2/setCount', {
            type: 'boost',
            count: data.remain_count
          })
          break
        case 'referral-envelope':
          store.dispatch('actv2/setCount', {
            type: 'referral',
            count: data.remain_count
          })
          store.dispatch('actv2/setRefRemainCount', {
            id: data.detail_id,
            count: data.detail_count
          })
          break
        case 'pong':
          this.wsConnCheckTime = Vue.moment()
          this.pingPongContainer.pong++
          break
        default:
          break
      }

      if (data.type === 'pong' && data.ping) {
        this.ws.send(JSON.stringify({
          'command': 'pong',
          'key': data.ping
        }))
      }
    } catch (e) {
      wsDebug(e, 'error')
    }
  }
}

GhostSocketObj.prototype.closeConnect = function () {
  clearInterval(this.wsConnCheckInterval)
  store.dispatch('setWs', {
    ws: null,
    type: JWT_TYPE
  })
  store.commit('CLEAR_NOTIFICATION')
  if (this.ws) {
    if (this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({
        'command': 'close'
      }))
    }
    this.ws.close()
    this.ws = null
  }
}

GhostSocketObj.prototype.reconnect = function () {
  let token = localStorage.getItem(JWT_TYPE + '_token')
  if (token) {
    this.closeConnect()
    this.initWs(token)
  }
}

GhostSocketObj.prototype.wsConnCheck = function () {
  wsDebug(`check ws connection`)
  if (this.ws.readyState !== 1) {
    wsDebug(`check readyState error:`, this.ws.readyState)
    return false
  }
  if (this.wsConnCheckTime && Vue.moment(this.wsConnCheckTime).diff(Vue.moment(), 'seconds') > 9) {
    wsDebug(`check time error`)
    return false
  }
  if (this.pingPongContainer.ping !== this.pingPongContainer.pong) {
    wsDebug('check ping pong error:', this.pingPongContainer)
    return false
  }
  wsDebug(`ws connection pass`)
  this.ws.send(JSON.stringify({
    'command': 'ping'
  }))
  this.pingPongContainer.ping++
  this.wsConnTryCount = 0
  return true
}

GhostSocketObj.prototype.wsConnRetry = function () {
  if (this.wsConnTryCount >= RETRY_COUNT) {
    this.wsConnError()
    return
  }
  wsDebug(`reconnecting...`)
  setTimeout(() => {
    this.reconnect()
    this.wsConnTryCount++
    wsDebug(`wsConnTryCount: ${this.wsConnTryCount}`)
  }, 2000)
}

GhostSocketObj.prototype.wsConnError = function () {
  wsDebug('ws connect error... STOP!')
  this.closeConnect()
}

export default GhostSocketObj
