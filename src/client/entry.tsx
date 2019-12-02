import React from 'react'
import { hydrate } from 'react-dom'
import { Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import App from '../app/containers/app'
import { preloadReady } from '../lib/async/asyncLoader'
import { HydrationTracker } from '../lib/partial-hydrate/tracker'

import './global.css'

const history = createBrowserHistory()

const render = (History: import('history').History<any>) =>
  preloadReady().then(() => {
    hydrate(
      <Router history={History}>
        <HydrationTracker />
        <App context={{}} />
      </Router>,
      document.querySelector('.app-root')
    )
  })

render(history)

if (module.hot) {
  module.hot.accept(
    [
      '../app/containers/app',
      '../lib/async/asyncLoader',
      '../lib/partial-hydrate/tracker'
    ],
    () => render(history)
  )
}
