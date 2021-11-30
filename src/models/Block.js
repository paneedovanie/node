const
  Encryption = require('../helpers/encryption.helper'),
  { precisionRoundMod } = require('../helpers/number.helper')

module.exports = class {
  constructor({ index = null, hash = null, transactions = null, merkelRoot = 0, reward = 0, prevHash = null, txHeight = 0, creator = null, timestamp = null }) {
    this.version = bcConfig.version
    this.index = index || this.generateIndex()
    this.transactions = transactions
    this.txHeight = txHeight
    this.reward = reward
    this.merkelRoot = merkelRoot || this.generateMerkleRoot()
    this.timestamp = timestamp || Date.now()
    this.creator = creator
    this.prevHash = prevHash
    this.hash = hash || this.generateHash()
  }

  generateIndex() {
    return 0
  }

  generateHash() {
    let properties = { ...this }
    delete properties.hash
    delete properties.signature

    const string = JSON.stringify(properties)
    return Encryption.hash('sha256', string)
  }

  hashForMerkle(tx1 = {}, tx2 = {}) {
    const string = JSON.stringify([tx1, tx2])
    return Encryption.hash('sha256', string)
  }

  generateMerkleRoot() {
    if (!this.transactions.length) return this.hashForMerkle()

    let
      level = 0,
      merkleList = [...this.transactions],
      tempList = [],
      reward = 0,
      txId = this.txHeight - merkleList.length + 1

    while (true) {
      let pair = []
      for (let i = 0; i < merkleList.length; i++) {
        let item = merkleList[i]

        if (!level && !item.txId) {
          item.txId = txId
          txId++
          reward += precisionRoundMod(item.fee, 16)
          this.reward = reward
        }

        pair.push(item)

        if (pair.length === 2) {
          tempList.push(this.hashForMerkle(pair[0], pair[1]))
          pair = []
        }
        else if (merkleList.length - 1 === i)
          tempList.push(this.hashForMerkle(pair[0], pair[0]))
      }

      level++
      if (tempList.length === 1) return tempList[0]
      merkleList = [...tempList]
      tempList = []
    }
  }

  isValid() {
    return this.merkelRoot === this.generateMerkleRoot() &&
      this.hash === this.generateHash()
  }
}