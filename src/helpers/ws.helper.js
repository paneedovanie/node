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
    node = null,
    result = null

  const { action, data } = messageReceiving(message)
  // console.log(action, data)

  const sendMessage = (message) => {
    if (typeof this.sendMessage === 'function')
      this.sendMessage(message)
    else
      this.send(messageSending(message))
  }

  switch (action) {
    case 'NEW_PEER':
      this.publicKey = data.publicKey
      this.host = data.host
      this.port = data.port

      try {
        block = await bc.valAndNxtBlk(data.lastBlock)

        sendMessage({
          action: 'REQUESTED_NEXT_BLOCK',
          data: block
        })
      } catch (err) {
        this.send(messageSending({
          action: 'RESET_CHAIN'
        }))
      }
      break

    case 'REQUEST_NEXT_BLOCK':
      block = await bc.valAndNxtBlk(data)

      sendMessage({
        action: 'REQUESTED_NEXT_BLOCK',
        data: block
      })
      break

    case 'RESET_CHAIN':
      bc.reset()

      sendMessage({
        action: 'REQUEST_NEXT_BLOCK',
        data: null
      })
      break

    case 'REQUESTED_NEXT_BLOCK':
      if (!data) {
        bc.status = 'validated'
        sendMessage({ action: 'VALIDATED_NODE' })
        return
      }

      bc.addBlock(data)
      sendMessage({ action: 'REQUEST_NEXT_BLOCK', data: data })
      break

    case 'CONFIG':
      if (bcConfig.VERSION < data.VERSION)
        bcConfig = data
      break

    case 'VALIDATED_NODE':
      sendMessage({
        action: 'CONFIG',
        data: bcConfig
      })

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
      result = await bc.addTransaction(data.tx, false)

      if (result.status === 'success')
        sendMessage({
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

    case 'VERIFY_BLOCK':
      result = await bc.addBlock(data, false)

      if (result)
        sendMessage({
          action: 'VERIFIED_BLOCK',
          data: {
            publicKey: config.key
          }
        })
      break

    case 'VERIFIED_BLOCK':
      bc.pendingBlock.confs.push(data.publicKey)
      break

    case 'ADD_BLOCK':
      bc.addBlock(data)
      console.log('BLOCK ADDED: Index -', data.index, '| HASH -', data.hash.substr(0, 4) + '....')
      break

    case 'SET_AS_CREATOR':
      bc.setAsCreator()
      break

    default:
      console.log(action)
  }
}