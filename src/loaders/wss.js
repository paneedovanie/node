const
  { Server } = require("ws"),
  { messageSending, messageReceiving } = require('../helpers/ws.helper')

module.exports = () => {
  const wss = new Server({ server });

  wss.on('connection', function connection(ws, request, client) {

    ws.send(messageSending({
      action: 'CONFIG',
      data: bcConfig
    }))

    ws.on('message', onMessageHandler);
  });

  events.on('ws-send', (message, cl = null) => {
    client.get(cl).send(messageSending(message))
  })

  return wss;
};

const onMessageHandler = async function (message) {
  let block = null
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
  }

  // events.emit(`ws-message_${message.action}`, message.data, this)
}