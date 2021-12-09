module.exports = class {
  constructor() {
    this.suffix = 'bc-'
  }

  VERIFY_TRANSACTION(data) {
    nodes.sendAll({
      action: 'VERIFY_TRANSACTION',
      data
    })
  }

  VERIFY_BLOCK(data) {
    nodes.sendAll({
      action: 'VERIFY_BLOCK',
      data
    })
  }

  ADD_TRANSACTION(data) {
    nodes.sendAll({
      action: 'ADD_TRANSACTION',
      data
    })
  }

  PAY_CREATOR(data) {
    nodes.sendAll({
      action: 'ADD_TRANSACTION',
      data
    })
  }

  async BLOCK_CREATED(block) {
    nodes.sendAll({
      action: 'ADD_BLOCK',
      data: block
    })
  }

  async NEW_CREATOR() {
    const node = await nodes.getRandomNode()

    if (!node) return bc.setAsCreator()

    node.sendMessage({
      action: 'SET_AS_CREATOR'
    })
  }

  async HIGH_AS_CREATOR() {
    const node = await nodes.getHighStakeNode()

    if (!node) return bc.setAsCreator()

    node.sendMessage({
      action: 'SET_AS_CREATOR'
    })
  }
}