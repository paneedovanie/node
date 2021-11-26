const WebSocket = require("ws");

module.exports = class {
  constructor({ host = '', port = 5000 }) {
    const node = new WebSocket(`ws://${host}:${port}`)

    node.on('open', () => this.onOpenHandler)
    node.on('message', this.onMessageHandler)
    node.on('close', this.onCloseHandler)

    return node
  }

  onOpenHandler() {

  }

  onMessageHandler() {

  }

  onCloseHandler() {

  }
}