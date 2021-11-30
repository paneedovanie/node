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
  const nodes = new Nodes

  if (config.hasRef) {
    const node = new Node({ host: config.refHost, port: config.refPort })
    node.sendMessage({ action: 'REQUEST_BLOCK', data: bc.getLastBlock() })
    nodes.add(node)
  }

  return nodes
}