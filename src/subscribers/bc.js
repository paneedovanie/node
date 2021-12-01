module.exports = class {
  constructor() {
    this.suffix = 'bc-'
  }

  BLOCK_CREATED(block) {
    console.log('block')
    nodes.sendAll({
      action: 'ADD_BLOCK',
      data: block
    })

    // if (!nodes.size())
    bc.setAsCreator()
  }

  VALID_FORGER() {

  }
}