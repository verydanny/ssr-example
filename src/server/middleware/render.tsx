import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../../app/containers/app'
import { AsyncChunkProvider } from '../../utils/async-provider'

import { Response, Request, NextFunction } from 'express'

export const serverRenderer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === 'GET' && req.path === '/') {
    const moduleIds = res.locals.serverStats
    const { publicPath, entry, ...stats } = res.locals.clientStats
    const entrypoint = entry.main
    const chunkJS: string[] = []
    const chunkCSS: string[] = []
    const hotUpdateRegex = /.*\.hot-update.*\.js$/

    const getClientFiles = (id: string | number) => {
      if (moduleIds[id]) {
        const serverModuleName = moduleIds[id].name

        return stats[serverModuleName]
      }

      return undefined
    }

    const sortModules = (webpack: () => string | number) => {
      const { files } = getClientFiles(webpack())

      if (files.js || files.css) {
        const filterHot = files.js.filter(
          (file: string) => !hotUpdateRegex.test(file)
        )
        chunkJS.push(...filterHot)
        chunkCSS.push(...files.css)
      }
    }

    const body = renderToString(
      <AsyncChunkProvider updateChunk={sortModules}>
        <App />
      </AsyncChunkProvider>
    )

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nice</title>
          ${entrypoint.css
            .map(
              (chunk: string) =>
                `<link href="${publicPath}${String(chunk)}" rel="stylesheet">`
            )
            .join('')}
          ${Array.from(new Set(chunkCSS))
            .map(
              chunk => `<link href="${publicPath}${chunk}" rel="stylesheet">`
            )
            .join('')}
        </head>
        <h1>Edit some middleware maybe</h1>
        <body>
          <div class="app-root">${body}</div>
          ${Array.from(new Set(chunkJS))
            .map(
              chunk =>
                `<script src="${publicPath}${String(chunk)}" async></script>`
            )
            .join('')}
          ${entrypoint.js
            .map(
              (chunk: string) =>
                `<script src="${publicPath}${String(chunk)}" async></script>`
            )
            .join('')}
        </body>
      </html>
    `)
  }

  next()
}
