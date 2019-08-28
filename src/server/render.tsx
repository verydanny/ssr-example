import React from 'react'
import { renderToString } from 'react-dom/server'
import { html } from 'lit-html'
import App from '../app/containers/app'

import { Response, Request } from 'express'

export default function serverRenderer() {
  return (req: Request, res: Response) => {
    res.status(200).send(html`
      <!DOCTYPE html>
      <html>
        <head>
          <title>App</title>
        </head>
        <body>
          <div id="root">
            ${renderToString(<App />)}
          </div>
          <script src="/client.js"></script>
        </body>
      </html>
    `)
  }
}
