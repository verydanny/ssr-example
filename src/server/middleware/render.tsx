import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../../app/containers/app'
import { AsyncChunkProvider } from '../../lib/async/async-provider'
import { HydrationManager, HydrationContext } from '../../lib/partial-hydrate'

import { Response, Request, NextFunction } from 'express'

interface EntryPoint {
  js: string[]
  css: string[]
}

export const serverRenderer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === 'GET' && req.path === '/') {
    const moduleIds = res.locals.serverStats
    const { publicPath, entry, ...stats } = res.locals.clientStats
    const entrypoint: EntryPoint = entry.main
    const chunkJS: string[] = []
    const chunkCSS: string[] = []
    const hotUpdateRegex = /.*\.hot-update.*\.js$/
    const hydrationManager = new HydrationManager()

    const getClientFiles = (id: string | number) => {
      if (moduleIds[id]) {
        const serverModuleName = moduleIds[id].name

        return stats[serverModuleName]
      }

      return undefined
    }

    const sortModules = (webpack: () => string | number, isStatic: boolean) => {
      const { files } = getClientFiles(webpack())

      if (files.js || files.css) {
        const filterHot = isStatic
          ? []
          : files.js.filter((file: string) => !hotUpdateRegex.test(file))
        chunkJS.push(...filterHot)
        chunkCSS.push(...files.css)
      }
    }

    const body = renderToString(
      <AsyncChunkProvider updateChunk={sortModules}>
        <HydrationContext.Provider value={hydrationManager}>
          <App />
        </HydrationContext.Provider>
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
            .filter((file: string) => !hotUpdateRegex.test(file))
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
