import Vue from 'vue'

import * as types from '../mutations/mutation-types'
import {
  login,
  logout,
  fetchUser,
  updateUser,
  fetchGames,
  fetchGamesDetail,
  fetchCategories,
  fetchPlayGroups,
  getBanner,
  fetchMessageCount,
  getAnnouncements,
  getDescription,
  trial,
  fetchJWTToken,
  eagle,
  serviceTrial
} from '@/api'

export default {
  login: ({ commit, state, dispatch }, { user }) => {
    commit('START_LOADING')
    return login(user).then(res => {
      let expires = new Date(res.expires_in)
      if (res.access_token && res.refresh_token) {
        localStorage.setItem('token_expire', res.expires_in)
        Vue.cookie.set('access_token', res.access_token, {
          expires: expires
        })
        Vue.cookie.set('refresh_token', res.refresh_token, {
          expires: expires
        })
        if (res.agent) {
          commit(types.SET_USER, {
            ...user,
            agent: res.agent
          })
        }
      }
      return dispatch('fetchUser').finally(() => { commit('END_LOADING') })
    }, error => {
      if (error.code === 9011 || error.code === 9013) {
        Vue.cookie.set('sessionid', error.data.sessionid)
      }
      commit('END_LOADING')
      return Promise.reject(error)
    })
  },
  trial: ({ commit, state, dispatch }, data) => {
    if (state.loading) {
      return
    }
    let payload = {}
    if (data && data.verification_code_0 && data.verification_code_1) {
      payload.verification_code_0 = data.verification_code_0
      payload.verification_code_1 = data.verification_code_1
    }

    commit('START_LOADING')
    return trial(payload).then((response) => {
      if (response.trial_auth_req === 1) {
        dispatch('openTrialVerifyDialog')
        return Promise.reject(response)
      }
      let tokenObj = response.token
      if (tokenObj.access_token && tokenObj.refresh_token) {
        localStorage.setItem('token_expire', tokenObj.expires_in)
        Vue.cookie.set('access_token', tokenObj.access_token, {
          expires: tokenObj.expires_in
        })
        Vue.cookie.set('refresh_token', tokenObj.refresh_token, {
          expires: tokenObj.expires_in
        })

        localStorage.setItem('access_token', tokenObj.access_token)

        if (state.token.venom) { serviceTrial().catch(() => {}) }
        if (response.agent) {
          commit(types.SET_USER, {
            ...state.user,
            agent: response.agent
          })
        }
      }

      return dispatch('fetchUser')
    }).catch((errRes) => {
      return Promise.reject(errRes)
    }).finally(() => { commit('END_LOADING') })
  },
  logout: ({ commit, state, dispatch }) => {
    dispatch('resetUser')
    return logout().then(
      res => Promise.resolve(res),
      errRes => Promise.reject(errRes)
    ).catch(() => {})
  },
  setUser: ({commit}, data) => {
    commit(types.SET_USER, data)
  },
  resetUser: ({commit, dispatch}) => {
    dispatch('token/clear', 'eagle')
    dispatch('token/clear', 'eider')
    commit(types.RESET_USER)
  },
  fetchUser: ({ commit, state, dispatch }) => {
    return fetchUser().then(res => {
      if (res.length > 0) {
        let user = res[0]
        commit(types.SET_USER, {
          ...user,
          logined: true
        })
        return Promise.resolve(res[0])
      } else {
        return Promise.reject(res[0])
      }
    }, error => {
      commit(types.SET_USER, {
        logined: false
      })
      return Promise.reject(error)
    })
  },
  updateUser: ({ commit }, {userId, updateData}) => {
    return updateUser(userId, updateData).then(data => {
      commit(types.SET_USER, data)
    })
  },
  fetchGames: ({ commit, state }) => {
    return fetchGames().then(res => {
      commit(types.SET_GAMES, {
        games: res
      })

      fetchGamesDetail().then(games => {
        const totalCategories = {}
        const totalBettrackPositions = {}
        const totalPlayGroups = {}
        const classificationMap = {}
        const classificationList = []

        games.forEach((game) => {
          let groupTag = game.group_tag.name || '其他'
          let gameList
          if (classificationMap[groupTag]) {
            gameList = classificationMap[groupTag]
          } else {
            gameList = []
            classificationMap[groupTag] = gameList
            classificationList.push({tag: groupTag, games: gameList})
          }
          gameList.push({
            code: game.code,
            display_name: game.display_name,
            rank: game.rank
          })

          const categories = game.categories
          categories.forEach((category) => {
            totalPlayGroups[category.id] = category.playgroups
          })
          delete categories.playgroups
          if (game.playpositions) {
            totalBettrackPositions[game.id] = {
              max_opts: game.playpositions.max_opts,
              positions: game.playpositions.data
            }
          }
          totalCategories[game.id] = categories
        })

        classificationList.forEach(item => {
          item.games.sort((a, b) => a.rank - b.rank)
        })
        commit(types.SET_GAME_CLASSIFICATION, classificationList)
        commit(types.SET_CATEGORIES, totalCategories)
        commit(types.SET_PLAYGROUP, totalPlayGroups)
        commit(types.SET_BETTRACK_POSITIONS, totalBettrackPositions)
      })
    })
  },
  fetchCategories: ({ commit, state }, gameId) => {
    return fetchCategories(gameId).then(res => {
      if (!state.categories[gameId]) {
        commit(types.SET_CATEGORIES, {[gameId]: res})
      }
      return res
    })
  },
  fetchPlayGroups: ({ commit, state }, categoryId) => {
    return fetchPlayGroups(categoryId).then(res => {
      commit(types.SET_PLAYGROUP, {[categoryId]: res})
      return res
    })
  },
  updateBetRecordDialog: ({ commit, state }, data) => {
    commit(types.UPDATE_BETRECORD_DIALOG, data)
  },
  startLoading: ({ commit }) => {
    commit(types.START_LOADING)
  },
  endLoading: ({ commit }) => {
    commit(types.END_LOADING)
  },
  setMessageCount: ({ commit }) => {
    fetchMessageCount().then(res => {
      commit(types.SET_MESSAGE_COUNT, res.message_count)
    })
  },
  addMessageCount: ({ commit }, count) => {
    commit(types.ADD_MESSAGE_COUNT, count)
  },
  setSystemConfig: ({ commit }, data) => {
    commit(types.SET_SYSTEM_CONFIG, data)
  },
  initLatestResultMap: ({ commit }, result) => {
    commit(types.INIT_LATEST_RESULT_MAP, result)
  },
  updateLatestResultMap: ({ commit }, {gameCode, latestResult}) => {
    commit(types.UPDATE_LATEST_RESULT_MAP, {gameCode, latestResult})
  },
  openTrialVerifyDialog: ({ commit, state }) => {
    commit(types.OPEN_VERIFICATION_DIALOG)
  },
  closeTrialVerifyDialog: ({ commit, state }) => {
    commit(types.CLOSE_VERIFICATION_DIALOG)
  },
  collectEnvelope: ({ commit, state }, data) => {
    commit(types.COLLECT_ENVELOPE, data)
  },
  updateCurrentChatRoom: ({ commit, state }, room) => {
    commit(types.UPDATE_CURRENTCHATROOM, room)
  },
  updateUnsettled: ({ commit, state }, value) => {
    commit(types.UPDATE_UNSETTLED, value)
  },
  startNiuNiuLoading: ({commit}, gameCode) => {
    commit(types.START_NIUNIU_LOADING, gameCode)
  },
  stopNiuNiuLoading: ({commit}, gameCode) => {
    commit(types.STOP_NIUNIU_LOADING, gameCode)
  },
  setWs: ({commit}, {ws, type}) => {
    commit(types.SET_WS, {ws, type})
  },
  removeNotification: ({ commit }) => {
    commit(types.REMOVE_NOTIFICATION)
  },
  addNotification: ({ commit }, notification) => {
    commit(types.ADD_NOTIFICATION, notification)
  },
  refreshResult: ({ commit }) => {
    commit(types.REFRESH_RESULT)
  },
  urgencySwitchGame: ({commit}, info) => {
    commit(types.SWITCH_GAME_STATE, info)
  },
  saveLastGame: ({commit}, id) => {
    commit(types.SAVE_LAST_GAME, id)
  },
  saveLastCategory: ({commit}, data) => {
    commit(types.SAVE_LAST_CATEGORY, data)
  },
  showBalanceDialog: ({commit}, data) => {
    commit(types.SHOW_BALANCE_DIALOG, data)
  },
  hideBalanceDialog: ({commit}) => {
    commit(types.HIDE_BALANCE_DIALOG)
  },
  fetchAnnouncement: ({commit}) => {
    getAnnouncements().then(
      result => {
        const datas = []
        result.forEach((item) => {
          if (item.platform !== 0) {
            datas.push(item)
          }
        })

        if (datas.length > 0) {
          datas.sort((a, b) => {
            return a.rank - b.rank
          })
          commit(types.FETCH_ANNOUNCEMENT, datas.map(data => data.announcement))
        }
      }
    ).catch(() => {})
  },
  fetchBanner: ({commit}) => {
    getBanner().then(
      result => {
        result.sort((a, b) => {
          return a.rank - b.rank
        })
        const banners = result.map((item, index) => {
          return {image: index === 0 ? item.image : '', rank: item.rank}
        })

        commit(types.FETCH_BANNER, banners)
        setTimeout(() => {
          commit(types.FETCH_BANNER, result)
        }, 1000)
      }
    ).catch(() => {})
  },
  fetchDescription: ({commit}) => {
    getDescription().then(response => {
      commit(types.FETCH_DESCRIPTION, response.filter(item => item.header_image))
    }).catch(() => {})
  },
  showCampaignEnvelope: ({commit}) => {
    commit(types.SHOW_CAMPAIGN_ENVELOPE)
  },
  hideCampaignEnvelope: ({commit}) => {
    commit(types.HIDE_CAMPAIGN_ENVELOPE)
  },
  fetchJWTToken: ({commit}, type) => {
    return fetchJWTToken(type).then(token => {
      commit(types.FETCH_JWT_TOKEN, {
        type,
        token
      })
      return token
    })
  },
  showChatroom: ({commit}) => {
    commit(types.SHOW_CHATROOM)
  },
  hideChatroom: ({commit}) => {
    commit(types.HIDE_CHATROOM)
  },
  fetchChatRoomUserInfo: ({commit, state}) => {
    Promise.all([eagle.fetchChatRoomUserInfo(state.user.username), eagle.fetchFolloweeList().catch(() => [])]).then(([user, followeeList]) => {
      commit(types.SET_USER, {
        followeeList,
        followable: user.followable
      })
    }).catch(e => {

    })
  },
  toggleFollowee: ({commit}, followee) => {
    return eagle.toggleFollowee(followee.username).then(res => {
      commit(types.TOGGLE_FOLLOWEE, followee)
      return res
    })
  }
}
