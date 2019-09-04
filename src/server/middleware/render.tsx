import React from 'react'
import { renderToString } from 'react-dom/server'
import App from '../../app/containers/app'

import { Response, Request, NextFunction } from 'express'

export const serverRenderer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.method === 'GET' && req.path === '/') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Apps</title>
          <link rel="stylesheet" href="/assets/client.css" >
        </head>
        <h1>This is HTML middleware</h1>
        <body>
          <div class="app-root">${renderToString(<App />)}</div>
          <script src="assets/client.js"></script>
        </body>
      </html>
    `)
  }

  return next()
}
