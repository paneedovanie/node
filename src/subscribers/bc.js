module.exports = class {
  constructor() {
    this.suffix = 'bc-'
  }

  BLOCK_CREATED(block) {
    nodes.sendAll({
      action: 'ADD_BLOCK',
      data: block
    })

    if (!nodes.size())
      bc.setAsCreator()
    else
      nodes.getRandomNode().sendMessage({
        action: 'SET_AS_CREATOR'
      })
  }

  VALID_FORGER() {

  }
}