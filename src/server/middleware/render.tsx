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
    const chunks: (string | number | symbol)[] = []

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
              updateChunk={chunk => chunk && chunks.push(chunk)}
            >
              <App />
            </AsyncChunkProvider>
          )}</div>
          ${chunks
            .map(
              chunk =>
                `<script src="assets/${String(chunk)}.js" async></script>`
            )
            .join('')}
          <script src="assets/client.js"></script>
        </body>
      </html>
    `)
  }

  next()
}
