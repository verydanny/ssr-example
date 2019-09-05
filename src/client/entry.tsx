import React from 'react'
import { hydrate } from 'react-dom'
import App from '../app/containers/app'

import './global.css'

hydrate(<App />, document.querySelector('.app-root'))

if (module.hot) {
  module.hot.accept()
}
