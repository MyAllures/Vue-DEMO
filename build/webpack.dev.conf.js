'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

let companyMap = {
  'hg9q_1': {
    id: 1,
    name: 'cc722'
  },
  '75ue_2': {
   id: 2,
   name: 'fh801'
 },
  'cg8s_3': {
   id: 3,
   name: 'a59'
 },
  '8fn3_4': {
   id: 4,
   name: 'hm7899'
 },
 'ee9m_5': {
    id: 5,
    name: '6j'
  }
}
let companyInfo = companyMap[process.env.company] || {id: 0, name: 'staging'}

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  // use 'inline-cheap-module-source-map' for IE debug
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      host: process.env.HOST || '',
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'app.html',
      template: 'app.html',
      host: process.env.HOST || '',
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      appHost: `https://storage.googleapis.com/lutra/${companyInfo.name}/`, // app storage url
      staticRoot: '/static/app/',
      inject: false
    }),
    new FriendlyErrorsPlugin()
  ]
})
