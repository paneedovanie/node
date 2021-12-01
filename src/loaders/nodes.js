const Node = require('../models/Node')

class Nodes {
  constructor() {
    this.list = []
  }

  async add({ host = null, port = 5000, type = null, confirm = false }) {
    const node = await new Node({ host, port, type, confirm })

    this.list.push(node)
  }

  async addExisting(model) {
    const node = await new Node({ model: model })

    this.list.push(node)
  }

  size() {
    return this.list.length
  }

  sendAll(message) {
    for (const node of this.list)
      node.sendMessage(message)
  }

  getRandom() {
    const index = Math.floor(Math.random() * (this.size - 0) + 0)

    return this.list[index]
  }
}

module.exports = async () => {
  const nodes = new Nodes()

  if (config.hasRef)
    nodes.add({ host: config.refHost, port: config.refPort, type: 'ref' })

  setInterval(() => {
    console.log(nodes.size())
  }, 1000)

  return nodes
}