const
  Encryption = require('../helpers/encryption.helper')

module.exports = class {
  constructor({ txId = null, to = null, from = null, data = null, fee = null, timestamp = null, hash = null, signature = null }) {
    this.txId = txId || null
    this.to = to
    this.from = from
    this.data = data
    this.fee = fee || this.generateFee()
    this.timestamp = timestamp || Date.now()
    this.hash = hash || this.generateHash()
    this.signature = signature
  }

  generateFee() {
    if (this.data) {
      let byteLen = 0
      if (this.data.coin)
        byteLen += this.data.coin.value.toString().length

      if (this.data.custom)
        byteLen += JSON.stringify(this.data.custom).length

      return byteLen * 0.0001
    } else
      return 0
  }

  generateHash() {
    let properties = { ...this }
    delete properties.hash
    delete properties.signature

    const string = JSON.stringify(properties)
    return Encryption.hash('sha256', string)
  }

  async sign(privateKey) {
    this.signature = await Encryption.sign(this.hash, privateKey)
  }

  isValid() {
    // if (this.from)
    //   return Encryption.verify(this.signature, this.generateHash(), this.from)
    // else
    return this.hash === this.generateHash()
  }
}