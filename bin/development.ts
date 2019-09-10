import express from 'express'
import { resolve } from 'path'
import webpackMerge from 'webpack-merge'
import { webpackClientServerMiddleware } from 'webpack-universal-compiler'
import { compose } from 'compose-middleware'
import { transformStats } from './transform-stats'

import { sharedConfig } from '../webpack/webpack.shared.config'
import { clientConfig } from '../webpack/webpack.client.config'
import { serverConfig } from '../webpack/webpack.server.config'

const env = {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  path: resolve(process.cwd(), 'dist')
} as const

const clientConfigMerged = webpackMerge(sharedConfig(env), clientConfig(env))
const serverConfigMerged = webpackMerge(sharedConfig(env), serverConfig(env))

const app = express()

app.use('/', express.static('public', { maxAge: 0, etag: false }))

const middleware = webpackClientServerMiddleware(
  clientConfigMerged,
  serverConfigMerged,
  {
    inMemoryFilesystem: true,
    hot: true
  }
)

app.use(middleware)

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.universal && res.locals.universal.bundle) {
      // middleware is the name of my server entryPoint export
      // aka ./src/server/entry.ts
      // middleware is an array of my middleware, including the react
      // renderer. This allows for hot-swapping middleware
      const { middleware, preloadAll } = res.locals.universal.bundle

      preloadAll().then(() => {
        compose(middleware)(req, res, next)
      })
    }

    next()
  }
)

app.use(
  (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.locals.universal && res.locals.universal.compilation) {
      const { clientStats, serverStats } = res.locals.universal.compilation

      const cStats = transformStats(clientStats.toJson())
      const sStats = transformStats(serverStats.toJson())

      res.locals.clientStats = JSON.parse(cStats)
      res.locals.serverStats = JSON.parse(sStats)
    }

    next()
  }
)

app.listen(8080, () => {
  console.log('Development server running on localhost:8080')
})
