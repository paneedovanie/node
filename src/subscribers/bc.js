module.exports = class {
  constructor() {
    this.suffix = 'bc-'
  }

  VERIFY_TRANSACTION(data) {
    console.log('verify')
    nodes.sendAll({
      action: 'VERIFY_TRANSACTION',
      data
    })
  }

  PAY_CREATOR(data) {
    console.log('pay')
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