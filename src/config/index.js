module.exports = {
  hasRef: process.env.HAS_REF || false,
  refHost: process.env.REF_HOST || 'localhost',
  refPort: process.env.REF_PORT || 5001,
  environment: process.env.NODE_ENV || 'production',
  port: process.env.PORT || '5000',
  secret: process.env.SECRET || 'SECRET',
  fee: process.env.FEE || 0.001,
  blockSize: process.env.BLOCK_SIZE || 1_000,
  blockTime: process.env.BLOCK_TIME || 1_000,
  blockConf: process.env.BLOCK_CONF || 5,
  tokens: {
    'HYP': { name: 'Hypto', coin: 'HYP', max: 1_000_000 }
  }
}