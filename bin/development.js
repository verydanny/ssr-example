const express = require('express')
const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const {
  webpackClientServerMiddleware
} = require('webpack-server-client-middleware')
const { compose } = require('compose-middleware')

const app = express()

app.use('/', express.static('public', { maxAge: 0, etag: false }))

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

function composeMiddlewares(req, res, next) {
  const { bundle } = res.locals.universal
  const middleware = compose(bundle.middleware)

  return middleware(req, res, next)
}

app.use(
  webpackClientServerMiddleware(clientConfigMerged, serverConfigMerged, {
    inMemoryFilesystem: true
  })
)

app.use(composeMiddlewares)

app.get('*')

app.listen('8080')
