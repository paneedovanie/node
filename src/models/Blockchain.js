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
    this.validator = false

    this.tempId = 0
    this.pendingTransactions = {}
    this.pendingBlock = null

    this.storageLastBlock = null

    this.config = config

    this.chain = []
    this.transactions = []

    this.checkForBlock = null
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
    const tx = new Transaction({ txId: 0, to: 'bd636f9dd3474c933054e4755f566f5c9b0f34b055e80622ee6f1b48fcad24bd', data: { coin: 100_000_000_000 } })
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

  async addBlock(data, verify = true) {
    clearTimeout(this.checkForBlock)

    this.checkForBlock = setTimeout(() => {
      console.log('we')
      events.emit('bc-HIGH_AS_CREATOR')
    }, bcConfig.blockTime + bcConfig.blockCfTm + 3000)

    const
      block = new Block(data),
      last = bc.lastBlock()

    if (!block.isValid() || (last && block.prevHash !== last.hash)) return false

    if (verify) {
      this.chain.push(block)

      const strBlock = JSON.stringify(block) + "\n"
      fs.appendFileSync(this.path, strBlock);
    }

    return true
  }

  async generateTransaction({ from = null, to = null, data = null }) {
    return new Transaction({ from, to, data })
  }

  async addStake({ from = null, data = null }) {
    const to = `STAKE:${from}`
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
        const totalConf = bcConfig.transConf > nodes.size() ? nodes.size() : bcConfig.transConf
        if (this.pendingTransactions[this.tempId].confs.length < totalConf) return

        this.transactions.push(transaction)
      }, bcConfig.transCfTm)

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
    }, bcConfig.blockTime - (bcConfig.transCfTm + 100))

    const timer = setTimeout(async () => {
      this.pendingBlock = await this.generateBlock()

      this.transactions = []

      const valTimer = setTimeout(async () => {
        const totalConf = bcConfig.blockConf > nodes.size() ? nodes.size() : bcConfig.blockConf
        if (this.pendingBlock.confs.length < totalConf) {
          const
            balance = this.balance(config.key),
            tx = new Transaction({ from: `STAKE:${config.key}`, to: 'bd636f9dd3474c933054e4755f566f5c9b0f34b055e80622ee6f1b48fcad24bd', data: { coin: balance.stake } })
          if (this.create) this.addTransaction(tx)
          else events.emit('bc-ADD_TRANSACTION', tx)

          return
        }

        this.addBlock(this.pendingBlock)
        events.emit('bc-BLOCK_CREATED', this.pendingBlock)

        console.log('BLOCK CREATED: Index -', this.pendingBlock.index, '| HASH -', this.pendingBlock.hash.substr(0, 4) + '....')
        this.pendingBlock = null

        clearTimeout(valTimer)
      }, bcConfig.blockCfTm)

      events.emit('bc-VERIFY_BLOCK', this.pendingBlock)

      clearTimeout(timer)
    }, bcConfig.blockTime)
  }

  balance(publicKey) {
    return new Promise((res, rej) => {
      let balance = {
        coin: 0,
        stake: 0,
        stakeTimestamp: 0
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

          if (tx.from === `STAKE:${publicKey}`) {
            balance.stake -= (tx.data.coin + tx.fee)
            balance.coin -= tx.data.coin
          } else if (tx.to === `STAKE:${publicKey}`) {
            balance.stake += tx.data.coin
            balance.coin -= tx.data.coin + tx.fee
            if (!balance.stakeTimestamp) balance.stakeTimestamp = tx.timestamp
          } else if (tx.data.coin) {
            if (tx.from === publicKey)
              balance.coin -= (tx.data.coin + tx.fee)
            if (tx.to === publicKey)
              balance.coin += tx.data.coin
          }

          if (!balance.stake) balance.stakeTimestamp = 0

          balance.coin = precisionRoundMod(balance.coin, bcConfig.decPlace)
        }
      });

      lineReader.on('close', () => {
        balance.coin = precisionRoundMod(balance.coin, bcConfig.decPlace)
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
        } else if (block.index === currBlock.index && block.hash !== block.hash)
          rej('Invalid Block')
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