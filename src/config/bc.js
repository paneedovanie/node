module.exports = {
  fee: process.env.FEE || 0.001,
  transSize: process.env.TRANS_SIZE || 1_000,
  transTime: process.env.TRANS_TIME || 1_000,
  transConf: process.env.TRANS_CONF || 5,
  blockSize: process.env.BLOCK_SIZE || 1_000,
  blockTime: process.env.BLOCK_TIME || 10_000,
  blockConf: process.env.BLOCK_CONF || 5,
  version: process.env.VERSION || 1
}