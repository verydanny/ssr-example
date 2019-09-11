/* eslint-disable @typescript-eslint/ban-ts-ignore */
import fs from 'fs'
import chalk from 'chalk'
import path from 'path'
import express from 'express'
import expressGzip from 'express-static-gzip'
// @ts-ignore
import { middleware, preloadAll } from '../dist/server/server'
import { compose } from 'compose-middleware'

const PORT = process.env.PORT
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
  const bottomsep = '═'
  const separator = process.platform !== 'win32' ? '━' : '-'

  app.listen(PORT, () => {
    const label =
      chalk.bgCyan.black(' 🌐 SERVER UP ') +
      chalk.cyan(` http://localhost:${PORT}/`)

    console.log(
      '\n',
      chalk.dim.bold(`${bottomsep.repeat(50)}`),
      '\n',
      label,
      '\n',
      chalk.dim(`${separator.repeat(50)}\n`)
    )
  })
})
