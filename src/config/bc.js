module.exports = {
  fee: process.env.FEE || 0.001,
  blockSize: process.env.BLOCK_SIZE || 1_000,
  blockTime: process.env.BLOCK_TIME || 10_000,
  blockConf: process.env.BLOCK_CONF || 5,
  version: process.env.VERSION || 1
}