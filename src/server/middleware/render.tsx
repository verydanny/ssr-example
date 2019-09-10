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
    const { modulesById, modulesByName } = res.locals.serverStats
    const {
      modulesById: clientModuleId,
      modulesByName: clientModuleName,
      entrypoints,
      publicPath
    } = res.locals.clientStats
    const chunkJS: string[] = []
    const chunkCSS: string[] = []

    const getClientIdName = (id: string | number) => {
      if (modulesById[id].name) {
        const serverModuleName = modulesById[id].name

        return clientModuleName[serverModuleName].id
          ? clientModuleName[serverModuleName].id
          : undefined
      }

      return undefined
    }

    const getClientCss = (id: number) => {
      if (clientModuleId[id] && clientModuleId[id].chunkFiles) {
        const chunks = clientModuleId[id].chunkFiles

        return chunks.css
      }
    }

    const getClientJs = (id: number) => {
      if (clientModuleId[id] && clientModuleId[id].chunkFiles) {
        const chunks = clientModuleId[id].chunkFiles

        return chunks.js
      }
    }

    const sortModules = (webpack: () => string | number) => {
      const moduleId = webpack()

      const normalizedId = getClientIdName(moduleId)

      if (normalizedId) {
        chunkJS.push(...getClientJs(normalizedId))
        chunkCSS.push(...getClientCss(normalizedId))
      }
    }

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Apps</title>
          ${entrypoints.css
            .map(
              (chunk: string) =>
                `<link href="${publicPath}${String(
                  chunk
                )}" rel="stylesheet"></script>`
            )
            .join('')}
        </head>
        <h1>Edit some middleware maybe</h1>
        <body>
          <div class="app-root">${renderToString(
            <AsyncChunkProvider updateChunk={sortModules}>
              <App />
            </AsyncChunkProvider>
          )}</div>
          ${Array.from(new Set(chunkJS))
            .map(
              chunk => `<script src="assets/${String(chunk)}" async></script>`
            )
            .join('')}
          ${entrypoints.js
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
