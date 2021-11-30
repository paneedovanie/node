const
  WebSocket = require("ws"),
  { messageSending, messageReceiving } = require('../helpers/ws.helper')

module.exports = class {
  constructor({ host = '', port = 5000 }) {
    this.model = new WebSocket(`ws://${host}:${port}`)

    this.model.on('open', () => this.onOpenHandler)
    this.model.on('message', this.onMessageHandler)
    this.model.on('close', this.onCloseHandler)
  }

  sendMessage(message) {
    this.model.send(messageSending(message))
  }

  onOpenHandler() {
    console.log('open')
  }

  onMessageHandler() {

  }

  onCloseHandler() {

  }
}