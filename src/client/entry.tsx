import React from 'react'
import { hydrate } from 'react-dom'
import App from '../app/containers/app'
import { preloadReady } from '../utils/async-component'

import './global.css'

preloadReady().then(() => {
  hydrate(<App />, document.querySelector('.app-root'))
})

if (module.hot) {
  module.hot.accept()
}
