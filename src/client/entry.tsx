import React from 'react'
import { hydrate } from 'react-dom'
import App from '../app/containers/app'
import { preloadReady } from '../lib/async/async-component'
import { HydrationTracker } from '../lib/partial-hydrate/tracker'

import './global.css'

preloadReady().then(() => {
  hydrate(
    <>
      <HydrationTracker />
      <App />
    </>,
    document.querySelector('.app-root')
  )
})

if (module.hot) {
  module.hot.accept()
}
