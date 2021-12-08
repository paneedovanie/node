const
  WebSocket = require("ws"),
  { messageSending, messageReceiving, onMessageHandler } = require('../helpers/ws.helper')

module.exports = class {
  constructor({ host = null, port = null, type = 'null', model = null }) {
    this.type = type
    this.host = host || model.host
    this.port = port || model.port
    this.model = model
    if (!this.model) {
      this.model = new WebSocket(`ws://${host}:${port}`)

      this.model.on('open', this.onOpenHandler.bind(this))
      this.model.on('message', onMessageHandler.bind(this))
      this.model.on('close', this.onCloseHandler.bind(this))
    }
  }

  sendMessage(message) {
    this.model.send(messageSending(message))
  }

  onOpenHandler() {
    switch (this.type) {
      case 'ref':
        this.sendMessage({
          action: 'NEW_PEER',
          data: {
            publicKey: config.key,
            host: config.host,
            port: config.port,
            lastBlock: bc.storageLastBlock
          }
        })
        break
      case 'new':
        this.sendMessage({
          action: 'OLD_NODE',
          data: {
            publicKey: config.key,
            host: config.host,
            port: config.port,
            type: 'old'
          }
        })
    }
  }

  onCloseHandler() {
    nodes.remove(`${this.host}:${this.port}`)
  }
}