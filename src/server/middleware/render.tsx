import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from '../../app/containers/app'
import { AsyncChunkProvider } from '../../lib/async/asyncProvider'
import { AssetContext } from '../../lib/asset/assetContext'
import { AssetManager } from '../../lib/asset/assetManager'
import { HydrationManager, HydrationContext } from '../../lib/partial-hydrate'
import { posts } from '../../data/random-posts'

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
  const { stats: serverStats } = res.locals.serverStats
  const {
    publicPath,
    entry,
    stats: clientStats,
    rawStats
  } = res.locals.clientStats
  const entrypoint: EntryPoint = entry.main
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
  const svgMap = new Set()

  assetManager.logAssets(function(assetKey: string, assetValue: any) {
    svgMap.add(assetValue.content)
  })

  const body = renderToString(
    <StaticRouter location={req.url} context={context}>
      <AssetContext.Provider value={assetManager}>
        <AsyncChunkProvider updateChunk={sortModules}>
          <HydrationContext.Provider value={hydrationManager}>
            <App context={posts} />
          </HydrationContext.Provider>
        </AsyncChunkProvider>
      </AssetContext.Provider>
    </StaticRouter>
  )

  res.status(200).send(`
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
        <svg style="display:none;">${Array.from(svgMap)
          .map(svg => svg)
          .join('')}</svg>
        <div class="app-root">${body}</div>
        ${Array.from(new Set(chunkJS))
          .map(
            chunk =>
              `<script type="application/javascript" src="${publicPath}${String(
                chunk
              )}" async></script>`
          )
          .join('')}
        ${entrypoint.js
          .filter(hotUpdateRegex)
          .map(
            (chunk: string) =>
              `<script type="application/javascript" src="${publicPath}${String(
                chunk
              )}" async></script>`
          )
          .join('')}
      </body>
    </html>
  `)

  next()
}
