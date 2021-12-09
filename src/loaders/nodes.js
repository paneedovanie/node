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
    const keys = Object.keys(this.list)

    let
      stakePool = [],
      totalStake = 0

    const
      myBalance = await bc.balance(config.key),
      myStake = myBalance.stake * Math.round((Date.now() - myBalance.stakeTimestamp) / (24 * 60000))

    stakePool.push({
      publicKey: config.key,
      min: 0.0001,
      max: myStake
    })

    totalStake += myStake

    for (const key of keys) {
      const
        node = this.list[key].model || this.list[key],
        balance = await bc.balance(node.publicKey),
        stake = balance.stake * Math.round((Date.now() - myBalance.stakeTimestamp) / (24 * 60000)),
        SPLastIndex = stakePool.length - 1

      if (stake) {
        stakePool.push({
          key,
          publicKey: node.publicKey,
          min: stakePool[SPLastIndex].max + 0.0001,
          max: stakePool[SPLastIndex].max + stake
        })

        totalStake += stake
      }
    }

    const rNum = Math.random() * (totalStake - 0.0001) + 0.0001

    for (const stake of stakePool) {
      if (stake.min < rNum && rNum < stake.max)
        return this.list[stake.key]
    }
  }

  async getHighStakeNode() {
    const keys = Object.keys(this.list)

    const
      myBalance = await bc.balance(config.key),
      myStake = myBalance.stake * Math.round((Date.now() - myBalance.stakeTimestamp) / (24 * 60000))

    let highest = {
      publicKey: config.key,
      stake: myStake
    }

    for (const key of keys) {
      const
        node = this.list[key].model || this.list[key],
        balance = await bc.balance(node.publicKey),
        stake = balance.stake * Math.round((Date.now() - myBalance.stakeTimestamp) / (24 * 60000))

      if (highest.stake < stake) {
        highest = {
          key: key,
          publicKey: node.publicKey,
          stake: stake
        }
      }
    }

    return this.list[highest.key]
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