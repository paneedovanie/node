module.exports = {
  hasRef: process.env.HAS_REF || false,
  refHost: process.env.REF_HOST || 'localhost',
  refPort: process.env.REF_PORT || 15000,
  environment: process.env.NODE_ENV || 'production',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 15000,
  secret: process.env.SECRET || 'SECRET',
  key: process.env.KEY || null,
  version: process.env.VERSION || 1
}