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
    this.sendMessage({
      action: 'NEW_PEER',
      data: {
        host: 'localhost',
        port: config.port,
        lastBlock: bc.storageLastBlock
      }
    })
    // this.sendMessage({ action: 'REQUEST_NEXT_BLOCK', data: bc.storageLastBlock })
  }

  onMessageHandler(message) {
    const { action, data } = messageReceiving(message)

    switch (action) {
      case 'CONFIG':
        bcConfig = data

        break
      case 'REQUESTED_NEXT_BLOCK':
        if (!data) {
          bc.status = 'validated'
          this.sendMessage({ action: 'VALIDATED_NODE' })
          return
        }

        bc.addBlock(data)
        this.sendMessage({ action: 'REQUEST_NEXT_BLOCK', data: data })

        break
    }
  }

  onCloseHandler() { }
}