const express = require('express')
const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const {
  webpackServerClientMiddleware,
  clientServerCompiler
} = require('webpack-server-client-middleware')

const app = express()

const sharedConfig = require('../webpack/webpack.shared.config')
const clientConfig = require('../webpack/webpack.client.config')
const serverConfig = require('../webpack/webpack.server.config')

const env = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  path: path.resolve(process.cwd(), 'dist')
}

const clientConfigMerged = webpackMerge(sharedConfig(env), clientConfig(env))
const serverConfigMerged = webpackMerge(sharedConfig(env), serverConfig(env))

const combinedConfig = [
  webpackMerge(sharedConfig(env), clientConfig(env)),
  webpackMerge(sharedConfig(env), serverConfig(env))
]

const clientDingus = clientServerCompiler()

// app.use(webpackServerClientMiddleware(webpack(clientConfigMerged), webpack(serverConfigMerged), {
//   inMemory: true,
//   bingus: true,
// }))

// app.use(webpackHotServerMiddleware(compiler))

// app.listen(8080)
