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
  const nodes = new Nodes(config.hasRef)

  if (config.hasRef) {
    const node = new Node({ host: config.refHost, port: config.refPort })

    node.onOpenHandler = () => {
      node.sendMessage({ action: 'REQUEST_BLOCK', data: bc.lastBlock() })
    }

    nodes.add(node)
  }

  return nodes
}