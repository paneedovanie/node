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

  PAY_CREATOR(data) {
    nodes.sendAll({
      action: 'ADD_TRANSACTION',
      data
    })
  }

  BLOCK_CREATED(block) {
    nodes.sendAll({
      action: 'ADD_BLOCK',
      data: block
    })
  }

  NEW_CREATOR() {
    if (!nodes.size())
      bc.setAsCreator()
    else
      nodes.getRandomNode().sendMessage({
        action: 'SET_AS_CREATOR'
      })
  }
}