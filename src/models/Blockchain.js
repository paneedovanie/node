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

    this.tempId = 0
    this.pendingTransactions = {}

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
          if (err) return rej(err);
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

          if (!block.isValid())
            rej('Invalid Block')
          if (block.prevHash ? block.prevHash !== prevBlock.hash : false)
            rej('Invalid Block')

          this.storageLastBlock = { ...block }

          delete block.transactions
          this.chain.push(block)

          prevBlock = block
        });

        lineReader.on('close', async () => {
          if (!config.hasRef)
            this.status = 'validated'

          res(true)
        });
      }
    })
  }

  reset() {
    try {
      fs.unlinkSync(this.path)
    } catch (err) { }
    this.chain = []
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

  async generateBlock() {
    const last = this.lastBlock(),
      transactions = this.transactions

    transactions.concat(this.transactions)

    this.transactions = []

    let index = 0,
      prevHash = null,
      txHeight = 0

    if (last) {
      index = last.index + 1
      prevHash = last.hash
      txHeight = last.txHeight + transactions.length
    }

    return new Block({ index, prevHash, transactions, txHeight, creator: config.key })
  }

  async addBlock(data) {
    const
      block = new Block(data),
      last = bc.lastBlock()

    if (!block.isValid() || (last && block.prevHash !== last.hash)) return

    this.chain.push(block)

    const strBlock = JSON.stringify(block) + "\n"
    fs.appendFileSync(this.path, strBlock);
  }

  async generateTransaction({ from = null, to = null, data = null }) {
    return new Transaction({ from, to, data })
  }

  async addTransaction(data, verify = true) {
    let
      transaction = new Transaction(data),
      total = transaction.data.coin + transaction.fee

    if (data.from) {
      const
        balance = await this.balance(data.from)

      for (const tx of this.transactions)
        if (tx.from === transaction.from) return { status: 'error', message: 'Pending transaction' }
      if (balance.coin < total) return { status: 'error', message: 'Insufficient Funds' }
      if (!await transaction.isValid()) return { status: 'error', message: 'Pending transaction' }
    }

    if (verify) {
      setTimeout(() => {
        this.transactions.push(transaction)
      }, bcConfig.transTime)

      this.pendingTransactions[this.tempId] = transaction

      events.emit('bc-VERIFY_TRANSACTION', {
        tempId: this.tempId,
        tx: transaction,
      })

      this.txId++
    }

    return { status: 'success' }
  }

  setAsCreator() {
    if (this.create) return

    this.create = true

    const last = this.lastBlock()

    if (last && last.reward > 0) {
      const tx = new Transaction({ to: last.creator, data: { coin: last.reward } })

      this.addTransaction(tx)
    }

    const newCreatorTimer = setTimeout(() => {
      this.create = false

      events.emit('bc-NEW_CREATOR')

      clearTimeout(newCreatorTimer)
    }, bcConfig.blockTime - (bcConfig.transTime * 1.5))

    const timer = setTimeout(async () => {
      const block = await this.generateBlock()

      this.transactions = []

      this.addBlock(block)
      events.emit('bc-BLOCK_CREATED', block)

      clearTimeout(timer)
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
      let result = null,
        currBlock = data ? new Block(data) : null,
        lastBlock = this.lastBlock()

      if (currBlock && (!currBlock.isValid() || currBlock.index > lastBlock.index)) rej('Invalid Block')

      const lineReader = readline.createInterface({
        input: fs.createReadStream(this.path)
      });

      lineReader.on('line', (strBlock) => {
        let block = new Block(JSON.parse(strBlock))

        if (!data) {
          result = block
          lineReader.close()
        } else if (currBlock.hash === block.prevHash) {
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