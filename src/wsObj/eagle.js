import store from '@/store'
import WebSocketBuilder from './builder'
import {
  urls,
  eagle
} from '@/api'

function onopen () {
  if (!this.originRoomId || this.originRoomId !== this.roomId) {
    this.joinRoom(this.roomId)
  }
  store.dispatch('chatroom/setRoomInfo', {currentRoomId: this.roomId})
  store.dispatch('chatroom/setStatus', 'open')
}

function onerror () {
  store.dispatch('chatroom/setStatus', 'closed')
}

function onclose () {
  store.dispatch('chatroom/setStatus', 'closed')
}

function onmessage (data) {
  switch (data.type) {
    case 'initial-data':
      store.dispatch('chatroom/init', data)
      break
    case 'message':
    case 'image':
      if (data.sender.username === store.state.user.username) {
        store.dispatch('chatroom/deleteFakeImg')
      }
      store.dispatch('chatroom/receiveMsg', data)
      break
    case 'sticker':
    case 'system':
    case 'red-envelope':
      store.dispatch('chatroom/receiveMsg', data)
      break
    case 'event':
      if (data.code === 'chatroom_disabled') {
        store.dispatch('chatroom/receiveMsg', {
          type: 'system',
          content: data.message
        })
        store.dispatch('chatroom/updatePermission', {
          eligible: false,
          messages: [data.message]
        })
        store.dispatch('chatroom/removeRoom', store.state.chatroom.currentRoomId)
      } else if (data.code === 'chat_permission_passed') {
        store.dispatch('chatroom/updatePermission', {
          eligible: true,
          messages: []
        })
      }
      break
    case 'betrecord-sharing':
      data.content = JSON.parse(data.content)
      store.dispatch('chatroom/receiveMsg', data)
      break
    case 'private':
      store.dispatch('chatroom/updatePermission', {
        eligible: false,
        messages: [data.content]
      })
  }
}

export class EagleWebSocket {
  constructor (token, roomId) {
    let url = `${urls.eagle.ws_host}/chat/?token=${token}`
    if (roomId) {
      url += `&room_id=${roomId}`
    }
    this.originRoomId = roomId
    this.roomId = roomId

    this.ws = new WebSocketBuilder(url)
    this.ws.subscribe({
      onmessage,
      onopen: onopen.bind(this),
      onerror,
      onclose
    })
    this.ws.connect()
    this.ws.setRetryHint()
    this.ws.heartBeat(10000)
  }

  sendMsg (message) {
    this.ws.send({
      'command': 'send',
      'type': 'message',
      'receiver': this.roomId,
      'content': message
    })
  }

  sendSticker (message) {
    this.ws.send({
      'command': 'send',
      'type': 'sticker',
      'receiver': this.roomId,
      'content': message
    })
  }

  fetchBannedList () {
    return eagle.fetchBannedList(this.roomId)
  }

  banMember (username, duration) {
    return eagle.controlChatMember(this.roomId, 'ban_user', {
      username,
      duration
    })
  }

  unbanMember (username, duration) {
    return eagle.controlChatMember(this.roomId, 'unban_user', {
      username
    })
  }

  joinRoom (roomId) {
    if (this.roomId === roomId) {
      return
    }
    this.roomId = roomId
    if (this.ws.wsState === WebSocket.OPEN) {
      store.dispatch('chatroom/clear')
      this.ws.send({
        'command': 'join',
        'receiver': this.roomId
      })
    }
  }

  leaveRoom () {
    if (this.ws.wsState === WebSocket.OPEN) {
      this.ws.send({
        'command': 'leave',
        'receiver': this.roomId
      })
    }
    this.ws.disconnect()
    store.dispatch('chatroom/clear')
    store.dispatch('chatroom/setWs', null)
  }
}
