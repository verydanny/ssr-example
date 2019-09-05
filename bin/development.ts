import express from 'express'
import { resolve } from 'path'
import webpackMerge from 'webpack-merge'
import { webpackClientServerMiddleware } from 'webpack-universal-compiler'
import { compose } from 'compose-middleware'

import { sharedConfig } from '../webpack/webpack.shared.config'
import { clientConfig } from '../webpack/webpack.client.config'
import { serverConfig } from '../webpack/webpack.server.config'

const app = express()

app.use('/', express.static('public', { maxAge: 0, etag: false }))

const env = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  path: resolve(process.cwd(), 'dist')
} as const

const clientConfigMerged = webpackMerge(sharedConfig(env), clientConfig(env))
const serverConfigMerged = webpackMerge(sharedConfig(env), serverConfig(env))

function composeMiddlewares(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (res.locals.universal && res.locals.universal.bundle) {
    // middleware is the name of my server entryPoint export
    // aka ./src/server/serverEntry.ts
    // middleware is an array of my middleware, including the react
    // renderer. This allows for hot-swapping middleware
    const { middleware } = res.locals.universal.bundle

    return compose(middleware)(req, res, next)
  }

  return next()
}

const middleware = webpackClientServerMiddleware(
  clientConfigMerged,
  serverConfigMerged,
  {
    inMemoryFilesystem: true,
    hot: true
  }
)

app.use(middleware)

app.use(composeMiddlewares)

app.listen(8080)
