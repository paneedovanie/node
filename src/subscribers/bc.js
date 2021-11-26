module.exports = class {
  constructor() {
    this.suffix = 'bc-'
  }

  BLOCK_CREATED() {
    if (!nodes.size())
      bc.setAsCreator()
  }
}