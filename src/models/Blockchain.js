const
  fs = require('fs'),
  readline = require('readline'),
  config = require('../config'),
  Block = require('./Block'),
  Transaction = require('./Transaction'),
  { EventEmitter } = require('events')

module.exports = class extends EventEmitter {
  constructor(num = 0) {
    super()
    this.num = num
    this.path = `./store/chain-${this.num}`
    this.status = 'inactive'
    this.create = false

    this.config = config

    this.chain = []
    this.transactions = []
    this.pendingBlocks = []
  }

  init() {
    return new Promise((res, rej) => {
      this.status = 'validating'

      if (!fs.existsSync(this.path))
        fs.writeFileSync(this.path, "");

      const lineReader = readline.createInterface({
        input: fs.createReadStream(this.path)
      });

      lineReader.on('line', (strBlock) => {
        let block = new Block(JSON.parse(strBlock))

        if (!block.isValid())
          rej('Invalid Block')

        delete block.transactions
        this.chain.push(block)
      });

      lineReader.on('close', () => {
        this.status = 'validated'
        res(true)
      });
    })
  }

  genesisBlock() {
    return this.chain[0]
  }

  lastBlock() {
    const n = this.chain.length
    return this.chain[n - 1]
  }

  generateGenesisBlock() {
    const block = new Block({ index: 0 })
    this.addBlock(block)
  }

  generateBlock() {
    const last = this.lastBlock(),
      transactions = this.transactions

    this.transactions = []

    let index = 0,
      prevHash = null,
      txHeight = 0

    if (last) {
      index = last.index + 1
      prevHash = last.hash
      txHeight = last.txHeight + transactions.length
    }

    return new Block({ index, prevHash, transactions, txHeight })
  }

  async addBlock(data) {
    const block = new Block(data)

    if (!await block.isValid()) return

    this.chain.push(block)

    const strBlock = JSON.stringify(block) + "\n"
    fs.appendFileSync(this.path, strBlock);
  }

  generateTransaction({ from = null, to = null, data = null }) {
    return new Transaction({ from, to, data })
  }

  async addTransaction(data) {
    const transaction = new Transaction(data)

    if (!await transaction.isValid()) return false

    this.transactions.push(transaction)

    return true
  }

  setAsCreator() {
    this.create = true

    setTimeout(() => {
      this.addBlock(this.generateBlock())
      events.emit('bc-BLOCK_CREATED')
    }, config.blockTime)
  }
}