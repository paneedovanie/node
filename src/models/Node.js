const
  WebSocket = require("ws"),
  { messageSending, messageReceiving } = require('../helpers/ws.helper')

module.exports = class {
  constructor({ host = '', port = 5000, ref = false }) {
    this.ref = ref
    this.model = new WebSocket(`ws://${host}:${port}`)

    this.model.on('open', this.onOpenHandler.bind(this))
    this.model.on('message', this.onMessageHandler.bind(this))
    this.model.on('close', this.onCloseHandler)
  }

  sendMessage(message) {
    this.model.send(messageSending(message))
  }

  onOpenHandler() {
    if (!this.ref) return
    this.sendMessage({ action: 'REQUEST_NEXT_BLOCK', data: bc.storageLastBlock })
  }

  onMessageHandler(message) {
    const { action, data } = messageReceiving(message)

    switch (action) {
      case 'REQUESTED_NEXT_BLOCK':
        const last = bc.lastBlock()

        if (!data) return bc.status = 'validated'

        if (last && data.prevHash !== last.hash) return

        bc.addBlock(data)
        this.sendMessage({ action: 'REQUEST_NEXT_BLOCK', data: data })
    }
  }

  onCloseHandler() { }
}