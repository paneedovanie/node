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
  try {
    await bc.init()
  } catch (err) {
    bc.reset()
  }

  if (!config.hasRef) {
    await bc.generateGenesisBlock()
    bc.setAsCreator()
  }

  global.nodes = await nodesLoader()

  subscribersLoader()
}