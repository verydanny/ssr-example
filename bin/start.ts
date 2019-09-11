/* eslint-disable @typescript-eslint/ban-ts-ignore */
import fs from 'fs'
import path from 'path'
import express from 'express'
import expressGzip from 'express-static-gzip'
// @ts-ignore
import { middleware, preloadAll } from '../dist/server/server'
import { compose } from 'compose-middleware'

const app = express()

const composed = compose(middleware)

const clientStats = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../dist/client/stats.json'), 'utf-8')
)

const serverStats = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../dist/server/stats.json'), 'utf-8')
)

const { publicPath } = clientStats

app.use(
  (
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.locals.clientStats = clientStats
    res.locals.serverStats = serverStats

    next()
  }
)

app.use(composed)

app.use(publicPath, expressGzip(path.resolve(__dirname, '../dist/client'), {}))

preloadAll().then(() => {
  app.listen(8080, () => console.log('Listening on http://localhost:8080'))
})
