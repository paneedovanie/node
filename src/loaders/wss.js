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
  const { action, data } = messageReceiving(message)

  switch (action) {
    case 'REQUEST_NEXT_BLOCK':
      const block = await bc.valAndNxtBlk(data)

      console.log(block)

      this.send(messageSending({
        action: 'REQUESTED_NEXT_BLOCK',
        data: block
      }))
  }

  // events.emit(`ws-message_${message.action}`, message.data, this)
}