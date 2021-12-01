const
  WebSocket = require("ws"),
  { messageSending, messageReceiving } = require('../helpers/ws.helper')

module.exports = class {
  constructor({ host = '', port = 5000, type = null, model = null }) {
    this.type = type
    this.model = model || new WebSocket(`ws://${host}:${port}`)

    this.model.on('open', this.onOpenHandler.bind(this))
    this.model.on('message', this.onMessageHandler.bind(this))
    this.model.on('close', this.onCloseHandler.bind(this))
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
            host: config.host,
            port: config.port,
            type: 'old'
          }
        })
    }
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

      case 'ADD_BLOCK':
        bc.addBlock(data)
        break

      case 'NEW_NODE':
        nodes.add(data)
        break
    }
  }

  onCloseHandler() {
    console.log('close')
  }
}