import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../../app/containers/app'
import { AsyncChunkProvider } from '../../utils/async-provider'

import { Stats } from 'webpack'

import { Response, Request, NextFunction } from 'express'

export const serverRenderer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === 'GET' && req.path === '/') {
    const oldChunks: (string | number | symbol)[] = []

    const { clientStats } = res.locals.universal.compilation
    const stats: Stats.ToJsonOutput = clientStats.toJson()
    const { modules, chunks: Chunks } = stats
    const chunkIds = new Set()
    const chunkFiles = new Set()
    const chunkNeeded = new Set()

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Apps</title>
          <link rel="stylesheet" href="/assets/client.css">
        </head>
        <h1>Edit some middleware maybe</h1>
        <body>
          <div class="app-root">${renderToString(
            <AsyncChunkProvider
              updateChunk={(chunk, webpack) => {
                const moduleId = webpack()

                if (modules) {
                  for (const { name, chunks } of modules) {
                    if (name === moduleId && chunks) {
                      chunkIds.add(chunks)
                    }
                  }

                  if (chunkIds && Chunks) {
                    for (const { id, files } of Chunks) {
                      if (
                        Array.from(chunkIds)
                          .flat()
                          .includes(id) &&
                        files
                      ) {
                        chunkFiles.add(files)
                      }
                    }
                  }
                }

                oldChunks.push(chunk)
              }}
            >
              <App />
            </AsyncChunkProvider>
          )}</div>
          ${Array.from(chunkFiles)
            .flat()
            .map(
              chunk => `<script src="assets/${String(chunk)}" async></script>`
            )
            .join('')}
          <script src="assets/client.js" async></script>
          <script src="assets/vendors~main.js" async></script>
        </body>
      </html>
    `)
  }

  next()
}
