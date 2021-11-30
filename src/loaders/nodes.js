const Node = require('../models/Node')

class Nodes {
  constructor() {
    this.list = []
  }

  add(node) {
    this.list.push(node)
  }

  size() {
    return this.list.length
  }
}

module.exports = async () => {
  const nodes = new Nodes()

  if (config.hasRef) {
    const node = new Node({ host: config.refHost, port: config.refPort, ref: true })

    nodes.add(node)
  }

  return nodes
}