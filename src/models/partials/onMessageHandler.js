
const { messageSending, messageReceiving } = require('../../helpers/ws.helper')

module.exports = async function (message) {
  let
    block = null,
    node = null

  const { action, data } = messageReceiving(message)

  switch (action) {
    case 'NEW_PEER':
      this.host = data.host
      this.port = data.port

      block = await bc.valAndNxtBlk(data.lastBlock)

      this.send(messageSending({
        action: 'REQUESTED_NEXT_BLOCK',
        data: block
      }))
      break

    case 'REQUEST_NEXT_BLOCK':
      block = await bc.valAndNxtBlk(data)

      this.send(messageSending({
        action: 'REQUESTED_NEXT_BLOCK',
        data: block
      }))
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

    case 'CONFIG':
      bcConfig = data

      break

    case 'VALIDATED_NODE':
      this.send(messageSending({
        action: 'CONFIG',
        data: bcConfig
      }))

      const tempMessage = {
        action: 'NEW_NODE',
        data: {
          host: this.host,
          port: this.port,
          type: 'new'
        }
      }

      nodes.sendAll(tempMessage)
      nodes.addExisting(this)
      break

    case 'NEW_NODE':
      nodes.add(data)
      break

    case 'OLD_NODE':
      this.host = data.host
      this.port = data.port

      nodes.addExisting(this)
      break

    case 'ADD_BLOCK':
      bc.addBlock(data)
      break

    case 'SET_AS_CREATOR':
      bc.setAsCreator()
      break
  }
}