const bc = require("../config/bc")

const messageSending = (message) => {
  if (typeof message === 'string') return message

  return JSON.stringify(message)
}

const messageReceiving = (message) => {
  message = message.toString()
  try {
    return JSON.parse(message)
  } catch (err) {
    return message
  }
}


module.exports = {
  messageSending,
  messageReceiving
}

module.exports.onMessageHandler = async function (message) {
  let
    block = null,
    node = null

  const { action, data } = messageReceiving(message)

  switch (action) {
    case 'NEW_PEER':
      this.host = data.host
      this.port = data.port

      try {
        block = await bc.valAndNxtBlk(data.lastBlock)

        this.send(messageSending({
          action: 'REQUESTED_NEXT_BLOCK',
          data: block
        }))
      } catch (err) {
        this.send(messageSending({
          action: 'RESET_CHAIN'
        }))
      }
      break

    case 'REQUEST_NEXT_BLOCK':
      block = await bc.valAndNxtBlk(data)

      this.send(messageSending({
        action: 'REQUESTED_NEXT_BLOCK',
        data: block
      }))
      break

    case 'RESET_CHAIN':
      bc.reset()

      this.sendMessage({
        action: 'REQUEST_NEXT_BLOCK',
        data: null
      })
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
      if (bcConfig.VERSION < data.VERSION)
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
      await nodes.add(data)
      break

    case 'OLD_NODE':
      this.host = data.host
      this.port = data.port

      await nodes.addExisting(this)
      break

    case 'ADD_TRANSACTION':
      if (bc.create)
        bc.addTransaction(data)
      break

    case 'VERIFY_TRANSACTION':
      const result = await bc.addTransaction(data.tx, false)
      if (result.status === 'success')
        this.sendMessage({
          action: 'VERIFIED_TRANSACTION',
          data: {
            tempId: data.tempId,
            publicKey: config.key
          }
        })
      break

    case 'VERIFIED_TRANSACTION':
      bc.pendingTransactions[data.tempId].confs.push(data.publicKey)
      break

    case 'ADD_BLOCK':
      bc.addBlock(data)
      break

    case 'SET_AS_CREATOR':
      bc.setAsCreator()
      break

    default:
      console.log(action)
  }
}