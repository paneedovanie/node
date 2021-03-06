const
  { Server } = require("ws"),
  { messageSending, messageReceiving, onMessageHandler } = require('../helpers/ws.helper')

module.exports = () => {
  const wss = new Server({ server });

  wss.on('connection', function connection(ws, request, client) {
    ws.on('message', onMessageHandler);
    ws.on('close', function () {
      nodes.remove(`${this.host}:${this.port}`)
    });
  });

  events.on('ws-send', (message, cl = null) => {
    client.get(cl).send(messageSending(message))
  })

  return wss;
};