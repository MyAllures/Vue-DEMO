'use strict'

const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const prefix = host + '/member'
const v1Member = host + '/v1/member'
const v2Member = host + '/v2/member'
const apiv2 = host + '/v2'
const profileApi = host + '/v2/members'
const wsEiderHost = env.eiderHost.replace(/"/g, '')
const eagleHost = env.eagleHost.replace(/"/g, '')
const wsEagleHost = env.wsEagleHost.replace(/"/g, '')
const venomHost = env.venomHost.replace(/"/g, '')
const wsVenomHost = env.venomSocket.replace(/"/g, '')

export default {
  venomHost,
  wsEiderHost,
  domain: host,
  wsVenomHost,
  chat_token: host + '/get_chat_token/',
  logout: host + '/logout/',
  check_agentname: host + '/v1/checkagent/',
  sendImgToChat: host + '/v1/manage/attachment/',
  setCookie: host + '/set_cookie/',
  red_envelope: host + '/v1/member/red_envelope/',
  user: profileApi + '/',
  login: prefix + '/login/',
  password: prefix + '/password/',
  withdraw_password: prefix + '/withdraw_password/',
  refresh_token: prefix + '/login/refresh/',
  payment: v1Member + '/payment/',
  register: v2Member + '/register/',
  get_jwt_token: host + '/get_jwt_token/',
  verification: v2Member + '/verification_code/',
  smsCode: v2Member + '/sms_verification/',
  games: v2Member + '/game/',
  category: v2Member + '/game/category/',
  playgroup: v2Member + '/game/playgroup/',
  schedule: v2Member + '/game/schedule/',
  playSetting: v2Member + '/game/playset/',
  agent_register: v2Member + '/agentapplication/',
  game_result: v2Member + '/result/',
  promotions: v2Member + '/promotion/',
  banner: v2Member + '/banners/',
  website: v2Member + '/website/',
  announcements: v2Member + '/announcements/',
  check_username: v2Member + '/username/',
  paymentType: v2Member + '/paymenttype/?opt_expand=1&platform=pc',
  betrecord: v2Member + '/betrecord/',
  personal_report: v2Member + '/personal_report/?opt_expand=play',
  betrecordByDay: v2Member + '/betrecord_dates/',
  transaction_record: v2Member + '/transaction/',
  return_amount: v2Member + '/return_amount/',
  result: '/result/',
  bank: v2Member + '/bank/',
  withdraw: v2Member + '/withdraw/',
  remitpayee: v2Member + '/remitpayee/',
  remit: v2Member + '/remit_transaction/',
  readMessage: v2Member + '/message/read/',
  messages: v2Member + '/messages/',
  messageCount: v2Member + '/message/count/',
  gamehistory: v2Member + '/history/',
  statistic: v2Member + '/statistic/',
  article: v2Member + '/website/franchising-program-page/',
  onine_heartbeat: v2Member + '/heart_beat/',
  bettrackrecord: v2Member + '/bettrackrecord/',
  bettrackrecordGeneral: v2Member + '/bettrackrecord_general/',
  personalOverview: v2Member + '/overview/',
  trend_chart: v2Member + '/trend_chart/',
  red_envelope_activities: apiv2 + '/red-envelope-activities/',
  snatch_red_envelope: apiv2 + '/transactions/snatch-red-envelope/',
  expert_plan: apiv2 + '/expert_plans/',
  expert_bettrack: host + '/betrecord/expert_plan_bets/',
  bettrackrecordv2: v2Member + '/bettrackrecordv2/',
  eagle: {
    host: eagleHost,
    ws_host: wsEagleHost,
    games: eagleHost + '/v1/games/',
    sendImg: eagleHost + '/v1/attachment/',
    stickers: eagleHost + '/v1/stickers/',
    room: eagleHost + '/v1/rooms/',
    room_banned_users: eagleHost + '/v1/room-banned-users/',
    global_data: eagleHost + '/v1/global-data/',
    followee_list: eagleHost + '/v1/users/followee-list/',
    toggle_follow: eagleHost + '/v1/users/toggle-follow/',
    user: eagleHost + '/v1/users/'
  },
  service_emoji: venomHost + '/chat/emoji/',
  service_stickers: venomHost + '/chat/stickers/',
  service_unread: venomHost + '/support/has_unread/',
  service_image_attachment: venomHost + '/chat/attachment',
  service_comment: venomHost + '/support/member_comment/',
  service_trial: venomHost + '/user/mark_as_trial/',
  actv2_activity: host + '/v1/member/envelope/activity-v2/',
  actv2_boost_get: host + '/v1/member/envelope/engagement_boost_details/',
  actv2_referral_code: apiv2 + '/member/referral-code/',
  actv2_referral_list: host + '/v1/member/envelope/referral_details/',
  actv2_re_open: host + '/v1/member/envelope/receive-envelope/',
  actv2_re_count: host + '/v2/remain-envelope-count/'
}
