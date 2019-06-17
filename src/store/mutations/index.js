import * as types from './mutation-types'
import Vue from 'vue'
import {saveLastGameData} from '../../utils'

export default {
  [types.SET_USER]: (state, user) => {
    Vue.set(state, 'user', {
      ...state.user,
      ...user
    })
  },
  [types.UPDATE_UNSETTLED]: (state, data) => {
    state.user.unsettled = data
  },
  [types.RESET_USER]: (state) => {
    state.user = {
      logined: false,
      account_type: undefined,
      unsettled: 0
    }
  },
  [types.SET_SYSTEM_CONFIG]: (state, data) => {
    state.systemConfig = data
  },
  [types.SET_WS]: (state, {ws, type}) => {
    state.ws[type] = ws
  },
  [types.ADD_NOTIFICATION]: (state, notification) => {
    state.notification.push(notification)
  },
  [types.REMOVE_NOTIFICATION]: (state, index) => {
    state.notification.shift()
  },
  [types.CLEAR_NOTIFICATION]: (state, index) => {
    state.notification = []
  },
  [types.SHOW_LOGIN_DIALOG]: (state) => {
    state.loginDialogVisible = true
  },
  [types.CLOSE_LOGINDIALOG]: (state) => {
    state.loginDialogVisible = false
  },
  [types.OPEN_BETRECORD_DIALOG]: (state) => {
    state.betRecordDialog.visible = true
  },
  [types.UPDATE_BETRECORD_DIALOG]: (state, {type, visible, schedule}) => {
    state.betRecordDialog.type = type
    state.betRecordDialog.schedule = schedule
    state.betRecordDialog.visible = visible
  },
  [types.SET_GAMES]: (state, { games }) => {
    state.games = games
  },
  [types.SET_CATEGORIES]: (state, categories) => {
    state.categories = {...state.categories, ...categories}
  },
  [types.SET_PLAYGROUP]: (state, playGroups) => {
    state.playGroups = {...state.playGroups, ...playGroups}
  },
  [types.SET_BETTRACK_POSITIONS]: (state, pos) => {
    state.bettrackPositions = pos
  },
  [types.SET_GAME_CLASSIFICATION]: (state, data) => {
    state.gameClassification = data
  },
  [types.START_LOADING]: (state, loading) => {
    state.loading = true
  },
  [types.END_LOADING]: (state) => {
    state.loading = false
  },
  [types.SET_MESSAGE_COUNT]: (state, count) => {
    state.messageCount = count
  },
  [types.ADD_MESSAGE_COUNT]: (state, count) => {
    state.messageCount = state.messageCount + count
  },
  [types.RESET_MESSAGE_COUNT]: (state) => {
    state.messageCount = 0
  },
  [types.OPEN_VERIFICATION_DIALOG]: (state) => {
    state.showTrialVerifyDialog = true
  },
  [types.CLOSE_VERIFICATION_DIALOG]: (state) => {
    state.showTrialVerifyDialog = false
  },
  [types.SHOW_NOTIFICATION]: (state) => {
    state.notificationVisible = true
  },
  [types.HIDE_NOTIFICATION]: (state) => {
    state.notificationVisible = false
  },
  [types.COLLECT_ENVELOPE]: (state, data) => {
    Vue.set(state.envelopes, data.envelope_status.id, data)
  },
  [types.UPDATE_CURRENTCHATROOM]: (state, room) => {
    state.chatRoom.currentRoom = room
  },
  [types.START_NIUNIU_LOADING]: (state, gameCode) => {
    if (state.latestResultMap[gameCode]) {
      state.latestResultMap[gameCode].cardLoading = true
    }
  },
  [types.STOP_NIUNIU_LOADING]: (state, gameCode) => {
    if (state.latestResultMap[gameCode]) {
      state.latestResultMap[gameCode].cardLoading = false
    }
  },
  [types.REFRESH_RESULT]: (state) => {
    state.isResultRefreshing = !state.isResultRefreshing
  },
  [types.INIT_LATEST_RESULT_MAP]: (state, latestResultMap) => {
    state.latestResultMap = latestResultMap
  },
  [types.UPDATE_LATEST_RESULT_MAP]: (state, {gameCode, latestResult}) => {
    state.latestResultMap[gameCode] = latestResult
  },
  [types.SWITCH_GAME_STATE]: (state, info) => {
    state.urgencySwitchedGame = info
  },
  [types.SAVE_LAST_GAME]: (state, id) => {
    state.lastGameData.lastGame = id
    saveLastGameData(state.lastGameData)
  },
  [types.SAVE_LAST_CATEGORY]: (state, {gameId, categoryId}) => {
    state.lastGameData.lastCategory[gameId] = categoryId
    saveLastGameData(state.lastGameData)
  },
  [types.SHOW_BALANCE_DIALOG]: (state, data) => {
    state.balanceDialog = Object.assign({visible: true}, data)
  },
  [types.HIDE_BALANCE_DIALOG]: (state) => {
    state.balanceDialog = {
      visible: false,
      totalAmount: 0,
      expectedWinAmount: 0
    }
  },
  [types.FETCH_ANNOUNCEMENT]: (state, data) => {
    state.announcements = data
  },
  [types.FETCH_BANNER]: (state, data) => {
    state.banners = data
  },
  [types.FETCH_DESCRIPTION]: (state, data) => {
    state.descriptions = data
  },
  [types.SHOW_CAMPAIGN_ENVELOPE]: (state) => {
    document.body.style.overflow = 'hidden'
    state.campaignEnvelope.visible = true
  },
  [types.HIDE_CAMPAIGN_ENVELOPE]: (state) => {
    document.body.style.overflow = ''
    state.campaignEnvelope.visible = false
  },
  [types.FETCH_JWT_TOKEN]: (state, {token, type}) => {
    state.jwt_token[type] = token
  },
  [types.SHOW_CHATROOM]: (state) => {
    state.chatRoom.isShowing = true
  },
  [types.HIDE_CHATROOM]: (state) => {
    state.chatRoom.isShowing = false
  },
  [types.TOGGLE_FOLLOWEE]: (state, followee) => {
    let idx = state.user.followeeList.findIndex((user) => user.username === followee.username)
    if (idx >= 0) {
      state.user.followeeList.splice(idx, 1)
    } else {
      state.user.followeeList.push(followee)
    }
  }
}
