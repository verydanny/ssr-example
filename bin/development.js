const express = require('express')
const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const webpackHotMiddleware = require('webpack-hot-middleware')
const { webpackClientServerMiddleware } = require('webpack-universal-compiler')
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
  if (res.locals.universal && res.locals.universal.bundle) {
    // middleware is the name of my server entryPoint export
    // aka ./src/server/serverEntry.ts
    // middleware is an array of my middleware, including the react
    // renderer. This allows for hot-swapping middleware
    const { middleware } = res.locals.universal.bundle
    const composedMiddleware = compose(middleware)

    return composedMiddleware(req, res, next)
  }

  next()
}

app.use(
  webpackClientServerMiddleware(clientConfigMerged, serverConfigMerged, {
    inMemoryFilesystem: true,
    hot: true
  })
)

app.use(composeMiddlewares)

app.get('*')

app.listen('8080')
