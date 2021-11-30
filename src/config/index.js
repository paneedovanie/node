module.exports = {
  hasRef: process.env.HAS_REF || false,
  refHost: process.env.REF_HOST || 'localhost',
  refPort: process.env.REF_PORT || 15000,
  environment: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 15000,
  secret: process.env.SECRET || 'SECRET',
  fee: process.env.FEE || 0.001,
  blockSize: process.env.BLOCK_SIZE || 1_000,
  blockTime: process.env.BLOCK_TIME || 10_000,
  blockConf: process.env.BLOCK_CONF || 5,
  key: process.env.KEY || null,
  version: process.env.VERSION || 1
}