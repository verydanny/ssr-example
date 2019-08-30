import React from 'react'
import { hydrate } from 'react-dom'
import App from '../app/containers/app'

hydrate(<App />, document.querySelector('.app-root'))
