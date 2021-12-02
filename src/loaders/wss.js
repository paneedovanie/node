const
  { Server } = require("ws"),
  { messageSending, messageReceiving } = require('../helpers/ws.helper'),
  onMessageHandler = require('../models/partials/onMessageHandler')

module.exports = () => {
  const wss = new Server({ server });

  wss.on('connection', function connection(ws, request, client) {
    ws.on('message', onMessageHandler);
  });

  events.on('ws-send', (message, cl = null) => {
    client.get(cl).send(messageSending(message))
  })

  return wss;
};