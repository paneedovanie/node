const
  path = require('path'),
  config = require(`../config`)

global.config = config
global.__basedir = path.join(__dirname, '..')