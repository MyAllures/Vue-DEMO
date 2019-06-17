'use strict'
var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"https://api.h9339.com"',
  // HOST: '"/api"',
  eiderHost: '"wss://eider.h9339.com"',
  eagleHost: '"https://eagle.h9339.com"',
  wsEagleHost: '"wss://eagle.h9339.com"',
  company: '"staging"',
  venomHost: '"https://venom.h9339.com"',
  venomSocket: '"wss://venom.h9339.com"',
})
