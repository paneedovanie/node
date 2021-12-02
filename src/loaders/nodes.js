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

  getRandomNode() {
    const
      index = Math.floor(Math.random() * (this.size() - 0) + 0),
      key = Object.keys(this.list)[index]

    return this.list[key]
  }
}

module.exports = async () => {
  const nodes = new Nodes()

  if (config.hasRef)
    nodes.add({ host: config.refHost, port: config.refPort, type: 'ref' })

  setInterval(() => {
    console.log('status', bc.create)
    console.log('nodes', nodes.size())
  }, 100)

  return nodes
}