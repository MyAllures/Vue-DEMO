import {getJWTToken} from '@/utils'
export default {
  namespaced: true,
  state: {
    eagle: getJWTToken('eagle'),
    venom: getJWTToken('venom')
  },
  mutations: {
    addToken: (state, {type, token}) => {
      state[type] = token
    },
    clear: (state, type) => {
      if (type !== 'all') {
        state[type] = ''
      } else {
        Object.keys(state).forEach(key => {
          state[key] = ''
        })
      }
    }
  },
  actions: {
    addToken: ({ commit }, data) => {
      commit('addToken', data)
    },
    clear: ({ commit }, type = 'all') => {
      commit('clear', type)
    }
  }
}
