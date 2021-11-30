const
  path = require('path'),
  config = require(`../config`),
  bcConfig = require(`../config/bc`)

global.config = config
global.bcConfig = bcConfig
global.__basedir = path.join(__dirname, '..')