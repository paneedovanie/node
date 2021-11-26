const { Server } = require("ws");

module.exports = () => {
  const wss = new Server({ server });

  wss.on('connection', function connection(ws, request, client) {
    ws.on('message', incoming);
  });

  // events.on('ws-send', (message, cl = null) => {
  //   client.get(cl).send(messageSending(message))
  // })

  return wss;
};

const incoming = function (message) {
  message = messageReceiving(message)

  // events.emit(`ws-message_${message.action}`, message.data, this)
}

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