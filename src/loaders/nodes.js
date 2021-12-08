const Node = require('../models/Node')

class Nodes {
  constructor() {
    this.list = {}
  }

  async add({ host = null, port = 5000, type = null, confirm = false }) {
    const node = await new Node({ host, port, type, confirm })

    this.list[`${host}:${port}`] = node
  }

  async addExisting(model) {
    const
      { host, port } = model,
      node = await new Node({ model: model })

    this.list[`${host}:${port}`] = node
  }

  remove(key) {
    delete this.list[key]
  }

  size() {
    return Object.keys(this.list).length
  }

  sendAll(message) {
    for (const key of Object.keys(this.list)) {
      const node = this.list[key]
      node.sendMessage(message)
    }
  }

  async getRandomNode() {
    const
      index = Math.floor(Math.random() * (this.size() - 0) + 0),
      key = Object.keys(this.list)[index]

    const keys = Object.keys(this.list)

    let
      stakePool = [],
      totalStake = 0

    const myBalance = await bc.balance(config.key)
    stakePool.push({
      publicKey: config.key,
      min: 0.0001,
      max: myBalance.stake
    })

    totalStake += myBalance.stake

    for (const key1 of keys) {
      const
        node = this.list[key1].model || this.list[key1],
        balance = await bc.balance(node.publicKey),
        SPLastIndex = stakePool.length - 1

      console.log(this.list[key1].model ? this.list[key1].model.publicKey : this.list[key1].publicKey)


      if (balance.stake) {
        stakePool.push({
          publicKey: node.publicKey,
          min: stakePool[SPLastIndex].max + 0.0001,
          max: stakePool[SPLastIndex].max + balance.stake
        })

        totalStake += balance.stake
      }
    }

    const rNum = Math.random() * (totalStake - 0.0001) + 0.0001

    console.log(rNum, totalStake, stakePool)

    for (const stake of stakePool) {
      if (stake.min < rNum && rNum < stake.max) {
        return this.list[key]
      }
    }
  }
}

module.exports = async () => {
  const nodes = new Nodes()

  if (config.hasRef)
    nodes.add({ host: config.refHost, port: config.refPort, type: 'ref' })

  setInterval(() => {
    // console.log('status', bc.create)
    // console.log('nodes', nodes.size())
  }, 100)

  return nodes
}