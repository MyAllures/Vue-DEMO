import axios from 'axios'
import qs from 'qs'
import urls from './urls'
import { JWT } from '@/utils/jwtToken'
const axiosGhost = axios.create()

function login (user) {
  return axiosGhost.post(urls.login, qs.stringify(user))
}

function logout () {
  return axiosGhost.post(urls.logout)
}

function agentRegister (userInfo) {
  return axiosGhost.post(urls.agent_register, qs.stringify(userInfo))
}

function getCaptcha () {
  return axiosGhost.get(urls.agent_captcha)
}

function getBanner () {
  return axiosGhost.get(`${urls.banner}?platform=pc`)
}

function getAnnouncements () {
  return axiosGhost.get(`${urls.announcements}?platform=1`)
}

function gethomePage () {
  return axiosGhost.get(`${urls.website}home-page/?platform=pc`)
}

function getDescription () {
  return axiosGhost.get(`${urls.website}descriptions/`)
}

function getPromotions () {
  return axiosGhost.get(urls.promotions)
}

function register (user) {
  return axiosGhost.post(urls.register, qs.stringify(user), {withCredentials: true})
}

function trial (data) {
  let payload = {account_type: 0}
  if (data && data.verification_code_0 && data.verification_code_0) {
    payload.verification_code_0 = data.verification_code_0
    payload.verification_code_1 = data.verification_code_1
  }
  return axiosGhost.post(`${urls.register}trial/`, qs.stringify(payload))
}

function checkUserName (username) {
  return axiosGhost.get(urls.check_username, { params: { username: username } })
}
function checkAgentName (username) {
  return axiosGhost.get(urls.check_agentname, { params: { username: username } })
}

function fetchGames () {
  return axiosGhost.get(urls.games)
}

function fetchGamesDetail () {
  return axiosGhost.get(`${urls.games}?platform=0&extras=categories,playpositions`)
}

function fetchUser () {
  return axiosGhost.get(urls.user)
}

function updateUser (userId, payload) {
  return axiosGhost.put(`${urls.user}${userId}/`, payload)
}

function updatePassword (password) {
  return axiosGhost.post(urls.password, qs.stringify(password))
}

function updateWithdrawPassword (withdrawPassword) {
  return axiosGhost.post(urls.withdraw_password, qs.stringify(withdrawPassword))
}

function fetchCategories (gameId) {
  return axiosGhost.get(`${urls.category}?&game=${gameId}`)
}

function fetchPlayGroups (categoryId) {
  return axiosGhost.get(`${urls.playgroup}?&category=${categoryId}`)
}

function fetchMatchPlaygroup (categoryId, matchId) {
  return axiosGhost.get(`${urls.playgroup}?category=${categoryId}&match=${matchId}`)
}

function fetchSchedule (gameId, gameCode) {
  return axiosGhost.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}`)
}

function fetchMoreSchedule ({gameId, gameCode, scheduleId, type}) {
  return axiosGhost.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}&track_type=${type}&schedule_id=${scheduleId}`)
}

function fetchCaptcha () {
  return axiosGhost.get(urls.verification).then(data => {
    data.captcha_src = urls.domain + data.captcha_src
    return data
  })
}

function fetchSmsCode (phone) {
  return axiosGhost.put(`${urls.smsCode}`, {phone_number: phone})
}

function fetchPaymentType () {
  return axiosGhost.get(urls.paymentType)
}

function placeBet (data) {
  return axiosGhost.post(urls.betrecord, data, {
    'Content-Type': 'application/json'
  })
}

function fetchTransactionRecord (option) {
  return axiosGhost.get(`${urls.transaction_record}?transaction_type=${option.transaction_type}&limit=${option.limit || 10}&offset=${option.offset}`)
}

function fetchBet (gameData) {
  return axiosGhost.get(`${urls.betrecord}?game=${gameData.gameId}&schedule=${gameData.scheduleId}&status=ongoing`).then(res => res.betrecords)
}

function fetchBetHistory (option) {
  let url = `${urls.betrecord}?limit=20`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function fetchReturnRecord (option) {
  let url = `${urls.return_amount}?limit=20`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function fetchBetTotal ({startdate, enddate, game, status}) {
  return axiosGhost.get(`${urls.betrecordByDay}?start_date=${startdate}&end_date=${enddate}&game=${game}&status=${status}`)
}

function fetchPersonalReport (option) {
  let url = urls.personal_report
  Object.keys(option).forEach((key, index) => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function getToken (oldToken) {
  if (!oldToken) {
    return
  }
  return axiosGhost.post(urls.refresh_token, {
    refresh_token: oldToken
  })
}

function fetchBank (onlyEnabled) {
  if (onlyEnabled) {
    return axiosGhost.get(urls.bank + '?status=1')
  }
  return axiosGhost.get(urls.bank)
}
function fetchGameResult (gameId) {
  return axiosGhost.get(`${urls.game_result}?game=${gameId}&opt_expand=next`)
}
function withdraw (info) {
  return axiosGhost.post(urls.withdraw, qs.stringify(info))
}

function fetchRemitpayee () {
  return axiosGhost.get(urls.remitpayee + '?embed=remit_type')
}

function remit (info) {
  return axiosGhost.post(urls.remit, info, {
    'Content-Type': 'application/json'
  })
}

function fetchMessages (option) {
  let url = `${urls.messages}?limit=10`
  Object.keys(option).forEach(key => {
    if (option[key] || option[key] === 0) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function fetchMessageCount () {
  return axiosGhost.get(urls.messageCount)
}

function readMessage (ids) {
  return axiosGhost.post(urls.readMessage,
    { ids: ids },
    { 'Content-Type': 'application/json' })
}

function fetchHistory (option) {
  let url = `${urls.gamehistory}?limit=30`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function fetchPlaySetting (id) {
  return axiosGhost.get(`${urls.playSetting}?game=${id}`)
}

function fetchStatistic (code) {
  return axiosGhost.get(`${urls.statistic}?game_code=${code}`)
}

function fetchTransactionStatus (id) {
  return axiosGhost.get(`${urls.payment}?transaction_ids=${id}`)
}

function fetchArticle () {
  return axiosGhost.get(urls.article)
}

function sendImgToChat (data) {
  return axiosGhost.post(`${urls.sendImgToChat}`, data)
}

function setCookie (cookie) {
  return axiosGhost.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

function sendRedEnvelope (data) {
  return axiosGhost.post(urls.red_envelope, data, {
    'Content-Type': 'application/json'
  })
}

function takeRedEnvelope (envelopId) {
  return axiosGhost.put(`${urls.red_envelope}${envelopId}/`, {
    'Content-Type': 'application/json'
  })
}

function fetchRedEnvelopeDetail (id) {
  return axiosGhost.get(`${urls.red_envelope}${id}/`)
}

function sendHeartBeat () {
  return axiosGhost.get(urls.onine_heartbeat)
}

function fetchBetTrack (option) {
  let url = `${urls.bettrackrecord}?`
  url += Object.keys(option).filter(key => !!option[key]).map(key => `${key}=${option[key]}`).join('&')
  return axiosGhost.get(url)
}

function fetchOverview () {
  return axiosGhost.get(`${urls.personalOverview}`)
}

function fetchTrendChart (params) {
  return axiosGhost.get(urls.trend_chart, {params})
}

function fetchRedEnvelopeActivities (id) {
  return axiosGhost.get(`${urls.red_envelope_activities}${id}/?platform=pc`)
}

function snatchRedEnvelope (id) {
  return axiosGhost.post(urls.snatch_red_envelope, {activity_id: id})
}

function fetchJWTToken (type) {
  return axiosGhost.post(urls.get_jwt_token, {service_type: JWT[type]}).then((res) => {
    return {
      expire: res.expire || 0,
      token: res[JWT[type] + '_token']
    }
  })
}

function fetchActV2 (type) {
  return axiosGhost.get(`${urls.actv2_activity}${type}/`)
}

function fetchActBoost () {
  return axiosGhost.get(urls.actv2_boost_get)
}

function fetchActRefCode () {
  return axiosGhost.get(urls.actv2_referral_code)
}

function fetchActRefList () {
  return axiosGhost.get(urls.actv2_referral_list)
}

function openActRe (type, id = '') {
  return axiosGhost.post(urls.actv2_re_open, {
    type: type,
    referral_detail_id: id
  })
}

function fetchActReCount () {
  return axiosGhost.get(urls.actv2_re_count)
}

/**
 * 專家計畫
 * @param {number} params.game - game_code
 * @param {number} params.scheme_type
    - FIVE_NUM_FOR_SINGLE: 單期5碼
    - SIX_NUM_FOR_SINGLE: 單期6碼
    - FIVE_NUM_FOR_TRIPLE: 3期5碼
    - SIX_NUM_FOR_DOUBLE: 2期6碼
 * @param {number} params.position
    - PK10: 1~10 (冠,亞,三,...,十)，預設應為 1
    - 時時彩: 1~5 (萬,千,百,十,個)，預設應為 1
 * @param {String} params.expert - 專家id，如果有傳此參數指定專家，則回傳資料中的cur_expert及cur_plans篩選出的內容會不同; 如未指定則以勝率最高的專家做為條件
 */
function fetchExpertPlan (params) {
  return axiosGhost.get(urls.expert_plan, {params})
}

/**
 * 追號一代二代共用追單
 * @param {String} params.start_date
 * @param {String} params.end_date
 * @param {String} params.game - code
 * @param {String} params.status - 查詢的追單狀態: choices: ongoing, death, win, cancelled
 */

function fetchGeneralBettrackRecord (params) {
  return axiosGhost.get(urls.bettrackrecordGeneral, {params})
}

/**
 * 追號二代追單查詢
 * @param {String} params.bet_date
 * @param {number} params.offset
 * @param {number} params.limit - code
 * @param {String} params.status - 查詢的追單狀態: choices: ongoing, death, win, cancelled
 */

function fetchBettrackRecordV2 (params) {
  return axiosGhost.get(urls.bettrackrecordv2, {params})
}

/**
 * 專家計劃多期下注
 * @param {string} data.game - 下注遊戲game_code ex. bcr
 * @param {number[]} data.issue_numbers - 期號
 * @param {number} data.position - 第n名
 * @param {number[]} data.bet_numbers - 下注號碼
 * @param {number} data.bet_amount - 下注金額
 */
function expertBetTrack (data) {
  return axiosGhost.post(urls.expert_bettrack, data)
}

/**
 * 追號(追投)
 * @param {Number} data.type - 追幾期
 * @param {Number} data.game_schedule - 起始schedule 的id
 * @param {String} data.play_code_pattern - (from category) e.g. jspk10_pl_gr_1p_[NUM]
 * @param {number[]} data.track_numbers - 下注號碼
 * @param {number} data.bet_amount - 下注金額
 * @param {number} data.bet_type - 2 -> 紀錄會回送2 {bet_type} 可判斷是否為專家計畫
 */
function sendBetTrack (data) {
  return axiosGhost.post(urls.bettrackrecord, data)
}

/**
 * 追號(追投)
 * @param {Number} data.type - 追幾期(最少1 最多30)
 * @param {Number} data.bet_amount - 下注金額
 * @param {Number} data.play_ids - 要下注的play的id(目前只能下注一個play，所以只能有一個play id)
 * @param {String} data.stopping_tracking_type - 停止追號選項 (choices: when_win_stop, never_stop)
 * @param {Number} data.multiple - 倍率, 為大於0的整數
 * @param {Number} data.game_schedule - 起始schedule 的id
 * @param {Object} data.betOption - 下注組合（六合彩、11選5、幸運農場）,不填後端默認為{}, options 組合數組裡面為下注組合
 */
function sendBetTrackV2 (data) {
  return axiosGhost.post(urls.bettrackrecordv2, data)
}

export {
  fetchGeneralBettrackRecord,
  fetchBettrackRecordV2,
  axiosGhost,
  fetchExpertPlan,
  expertBetTrack,
  sendBetTrack,
  sendBetTrackV2,
  login,
  logout,
  agentRegister,
  getCaptcha,
  getBanner,
  getAnnouncements,
  gethomePage,
  getDescription,
  getPromotions,
  register,
  checkUserName,
  checkAgentName,
  fetchGames,
  fetchGamesDetail,
  fetchUser,
  updateUser,
  updatePassword,
  updateWithdrawPassword,
  fetchCategories,
  fetchPlayGroups,
  fetchMatchPlaygroup,
  fetchSchedule,
  fetchMoreSchedule,
  fetchCaptcha,
  fetchSmsCode,
  fetchPaymentType,
  placeBet,
  fetchTransactionRecord,
  fetchBet,
  fetchBetHistory,
  fetchReturnRecord,
  fetchBetTotal,
  fetchPersonalReport,
  getToken,
  fetchBank,
  fetchGameResult,
  withdraw,
  fetchRemitpayee,
  remit,
  fetchMessages,
  fetchMessageCount,
  readMessage,
  fetchHistory,
  fetchPlaySetting,
  fetchStatistic,
  fetchTransactionStatus,
  fetchArticle,
  sendImgToChat,
  setCookie,
  sendRedEnvelope,
  takeRedEnvelope,
  fetchRedEnvelopeDetail,
  sendHeartBeat,
  fetchBetTrack,
  fetchOverview,
  fetchTrendChart,
  fetchRedEnvelopeActivities,
  snatchRedEnvelope,
  fetchJWTToken,
  fetchActV2,
  fetchActBoost,
  fetchActRefCode,
  fetchActRefList,
  openActRe,
  fetchActReCount,
  trial
}
