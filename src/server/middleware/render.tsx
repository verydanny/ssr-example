import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { html } from 'common-tags'

import App from '../../app/containers/app'
import { AsyncChunkContext } from '../../lib/async/asyncContext'
import { AsyncChunkManager } from '../../lib/async/asyncChunkManager'
import { AssetContext } from '../../lib/asset/assetContext'
import { AssetManager } from '../../lib/asset/assetManager'
import { HydrationManager, HydrationContext } from '../../lib/partial-hydrate'
import { posts } from '../../data/random-posts'

import { Response, Request } from 'express'

interface EntryPoint {
  js: string[]
  css: string[]
}

const svgMap: string[] = []

export const serverRenderer = (req: Request, res: Response) => {
  const { stats: serverStats } = res.locals.serverStats
  const {
    publicPath,
    entry,
    stats: clientStats,
    rawStats
  } = res.locals.clientStats
  const entrypoint: EntryPoint = entry.app
  const chunkJS: string[] = []
  const chunkCSS: string[] = []
  const hotUpdateRegex = (file: string) => !/.*\.hot-update.*\.js$/.test(file)
  const hydrationManager = new HydrationManager()
  const context = {}

  const getClientFiles = (id: string | number) => {
    if (serverStats[id]) {
      const serverModuleName = serverStats[id].name

      if (clientStats[serverModuleName]) {
        return clientStats[serverModuleName]
      } else if (
        rawStats[serverModuleName] &&
        rawStats[serverModuleName].name
      ) {
        return clientStats[rawStats[serverModuleName].name]
          ? clientStats[rawStats[serverModuleName].name]
          : undefined
      }

      return undefined
    }

    return undefined
  }

  const sortModules = (webpack: string | number, isStatic: boolean) => {
    const { files } = getClientFiles(webpack)

    if (files.js || files.css) {
      const filterHot = !isStatic ? files.js.filter(hotUpdateRegex) : []
      chunkJS.push(...filterHot)
      chunkCSS.push(...files.css)
    }
  }

  const assetManager = new AssetManager()
  const asyncChunkManager = new AsyncChunkManager()

  assetManager.logAssets((assetKey: string, assetValue: any) => {
    svgMap.push(assetValue.content)
  })

  asyncChunkManager.recordAssetsCallback(sortModules)

  const body = renderToString(
    <StaticRouter location={req.url} context={context}>
      <AsyncChunkContext.Provider value={asyncChunkManager}>
        <HydrationContext.Provider value={hydrationManager}>
          <AssetContext.Provider value={assetManager}>
            <App context={posts} />
          </AssetContext.Provider>
        </HydrationContext.Provider>
      </AsyncChunkContext.Provider>
    </StaticRouter>
  )

  const app = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Nice</title>
        ${Array.from(new Set(chunkCSS))
          .map(
            chunk =>
              `<link href="${publicPath}${chunk}" type="text/css" rel="stylesheet">`
          )
          .join('')}
        ${entrypoint.css
          .map(
            (chunk: string) =>
              `<link href="${publicPath}${String(
                chunk
              )}" type="text/css" rel="stylesheet">`
          )
          .join('')}
      </head>
      <h1>Edit some middleware maybe</h1>
      <body>
        ${
          svgMap.length > 0
            ? `<svg style="visibility:hidden;width:0;height:0;position:absolute;">${Array.from(
                new Set(svgMap)
              ).join('')}</svg>`
            : ''
        }
        <div class="app-root">${body}</div>
        ${Array.from(new Set(chunkJS))
          .map(
            chunk =>
              `<script async type="application/javascript" src="${publicPath}${String(
                chunk
              )}"></script>`
          )
          .join('')}
        ${entrypoint.js
          .filter(hotUpdateRegex)
          .map(
            (chunk: string) =>
              `<script async type="application/javascript" src="${publicPath}${String(
                chunk
              )}"></script>`
          )
          .join('')}
      </body>
    </html>
  `

  res.status(200).send(app)
}
