const Node = require('../models/Node')

class Nodes {
  constructor() {
    this.list = []
  }

  add({ host = null, port = 5000, ref = false }) {
    const node = new Node({ host, port, ref })

    this.list.push(node)
  }

  size() {
    return this.list.length
  }

  sendAll(message) {
    for (const node of this.list)
      node.sendMessage(message)
  }
}

module.exports = async () => {
  const nodes = new Nodes()

  if (config.hasRef)
    nodes.add({ host: config.refHost, port: config.refPort, ref: true })

  return nodes
}