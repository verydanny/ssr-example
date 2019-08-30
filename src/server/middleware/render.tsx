/* eslint-disable @typescript-eslint/no-unused-vars */
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
    res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>App</title>
      </head>
      <body>
        <div class="app-root">${renderToString(<App />)}</div>
        <script src="assets/client.js"></script>
      </body>
    </html>
  `)
  }

  next()
}
