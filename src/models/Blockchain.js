const
  fs = require('fs'),
  readline = require('readline'),
  config = require('../config'),
  bcConfig = require('../config/bc'),
  Block = require('./Block'),
  Transaction = require('./Transaction'),
  { EventEmitter } = require('events'),
  { precisionRoundMod } = require('../helpers/number.helper')

module.exports = class extends EventEmitter {
  constructor(num = 0) {
    super()
    this.num = num
    this.path = `./store/chain-${this.num}`
    this.status = 'inactive'
    this.create = false

    this.storageLastBlock = null

    this.config = config

    this.chain = []
    this.transactions = []
    this.pendingBlocks = []
  }

  init() {
    return new Promise((res, rej) => {
      let prevBlock = null
      this.status = 'validating'

      if (!fs.existsSync(this.path)) {

        fs.mkdir('store', { recursive: true }, (err) => {
          if (err) return cb(err);
        })

        fs.writeFileSync(this.path, "")

        this.status = 'validated'
        res(true)
      } else {
        const lineReader = readline.createInterface({
          input: fs.createReadStream(this.path)
        });

        lineReader.on('line', (strBlock) => {
          if (!strBlock || strBlock === '') return
          let block = new Block(JSON.parse(strBlock))

          if (!block.isValid() || block.prevHash ? block.prevHash !== prevBlock.hash : false)
            rej('Invalid Block')

          this.storageLastBlock = { ...block }

          delete block.transactions
          this.chain.push(block)

          prevBlock = block
        });

        lineReader.on('close', async () => {
          if (!config.hasRef) {
            this.status = 'validated'
            await bc.generateGenesisBlock()
          }
          res(true)
        });
      }
    })
  }

  genesisBlock() {
    return this.chain[0]
  }

  lastBlock() {
    const n = this.chain.length
    return this.chain[n - 1]
  }

  async generateGenesisBlock() {
    if (this.chain.length) return
    const tx = new Transaction({ txId: 0, to: '3169856db82b60fb4ae1090025ff2e48f8b93e7e43843ab261b467ae290b476b', data: { coin: 100_000_000_000 } })
    this.transactions = [tx]
    this.addBlock(await this.generateBlock())
  }

  generateBlock() {
    const last = this.lastBlock(),
      transactions = this.transactions

    transactions.concat(this.transactions)

    this.transactions = []

    let index = 0,
      prevHash = null,
      txHeight = 0

    if (last) {
      if (last.reward > 0)
        transactions.unshift(new Transaction({ to: last.creator, data: { coin: last.reward } }))

      index = last.index + 1
      prevHash = last.hash
      txHeight = last.txHeight + transactions.length
    }

    return new Block({ index, prevHash, transactions, txHeight, creator: config.key })
  }

  async addBlock(data) {
    const block = new Block(data)

    if (!block.isValid()) return

    this.chain.push(block)

    const strBlock = JSON.stringify(block) + "\n"
    fs.appendFileSync(this.path, strBlock);
  }

  async generateTransaction({ from = null, to = null, data = null }) {
    return new Transaction({ from, to, data })
  }

  async addTransaction(data) {
    const
      balance = await this.balance(data.from),
      transaction = new Transaction(data)

    let total = transaction.data.coin + transaction.fee

    for (const tx of this.transactions)
      if (tx.from === transaction.from) return { status: 'error', message: 'Pending transaction' }
    if (balance.coin < total) return { status: 'error', message: 'Insufficient Funds' }
    if (!await transaction.isValid()) return { status: 'error', message: 'Pending transaction' }

    this.transactions.push(transaction)

    return { status: 'success' }
  }

  setAsCreator() {
    this.create = true

    setTimeout(() => {
      this.addBlock(this.generateBlock())
      events.emit('bc-BLOCK_CREATED')
    }, bcConfig.blockTime)
  }

  balance(publicKey) {
    return new Promise((res, rej) => {
      let balance = {
        coin: 0
      }

      if (!fs.existsSync(this.path))
        fs.writeFileSync(this.path, "");

      const lineReader = readline.createInterface({
        input: fs.createReadStream(this.path)
      });

      lineReader.on('line', (strBlock) => {
        let block = new Block(JSON.parse(strBlock))

        for (const tx of block.transactions) {
          if (!tx.data || publicKey !== tx.from && publicKey !== tx.to)
            continue

          if (tx.data.coin) {
            if (!balance.coin) balance.coin = 0

            if (tx.from === publicKey)
              balance.coin -= tx.data.coin + tx.fee
            if (tx.to === publicKey)
              balance.coin += tx.data.coin

            balance.coin = precisionRoundMod(balance.coin, 16)
          }
        }
      });

      lineReader.on('close', () => {
        balance.coin = precisionRoundMod(balance.coin, 16)
        res(balance)
      });
    })
  }

  valAndNxtBlk(data) {
    return new Promise((res, rej) => {
      let result = null
      let currBlock = data ? new Block(data) : null

      if (currBlock && !currBlock.isValid()) rej('Invalid Block')

      const lineReader = readline.createInterface({
        input: fs.createReadStream(this.path)
      });

      lineReader.on('line', (strBlock) => {
        let block = new Block(JSON.parse(strBlock))

        if (!data) {
          result = block
          lineReader.close()
        }

        else if (currBlock.hash === block.prevHash) {
          result = block
          lineReader.close()
        }
      });

      lineReader.on('close', () => {
        res(result)
      });
    })
  }
}