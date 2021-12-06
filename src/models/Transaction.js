const
  Encryption = require('../helpers/encryption.helper'),
  { precisionRoundMod } = require('../helpers/number.helper')

module.exports = class {
  constructor({ txId = null, to = null, confs = [], from = null, data = null, fee = null, timestamp = null, hash = null, signature = null }) {
    this.txId = txId || null
    this.to = to
    this.from = from
    this.data = data
    this.fee = fee || this.generateFee()
    this.confs = confs
    this.timestamp = timestamp || Date.now()
    this.hash = hash || this.generateHash()
    this.signature = signature
  }

  generateFee() {
    if (this.data && this.from) {
      let byteLen = 0
      if (this.data.coin)
        byteLen += this.data.coin.toString().length

      if (this.data.custom)
        byteLen += JSON.stringify(this.data.custom).length

      return precisionRoundMod(byteLen * 0.0001, 16)
    } else
      return 0
  }

  generateHash() {
    let properties = { ...this }
    delete properties.confs
    delete properties.hash
    delete properties.signature

    const string = JSON.stringify(properties)
    return Encryption.hash('sha256', string)
  }

  async sign(privateKey) {
    this.signature = await Encryption.sign(this.hash, privateKey)
  }

  isValid() {
    if (this.txId !== 0 || !this.from)
      return Encryption.verify(this.signature, this.generateHash(), this.from)
    else
      return this.hash === this.generateHash()
  }
}