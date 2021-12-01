require('dotenv').config()
require('./global')

const
  Blockchain = require('../models/Blockchain'),
  serverLoader = require('./server'),
  wssLoader = require('./wss'),
  nodesLoader = require('./nodes'),
  eventLoader = require('./event'),
  subscribersLoader = require('./subscribers')

module.exports = async () => {
  global.events = eventLoader()

  global.server = await serverLoader()
  console.log("Server Initialized")

  global.wss = await wssLoader()
  console.log("Websocket Initialized")

  global.bc = new Blockchain
  await bc.init()
  await bc.generateGenesisBlock()
  if (!config.hasRef)
    bc.setAsCreator()

  global.nodes = await nodesLoader()

  subscribersLoader()
}