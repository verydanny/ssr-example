import React from 'react'
import { hydrate } from 'react-dom'
import App from '../app/containers/app'
import { preloadReady } from '../app/utils/async-component'
import { HydrationTracker } from '../app/partial-hydrate/tracker'

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
