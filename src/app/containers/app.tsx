import React from 'react'
import { HelloWorld } from '../components/hello-world'
import { HelloWorldTwo } from '../components/other-component'

const App = () => (
  <div className="app-container">
    <HelloWorld />
    <HelloWorldTwo />
  </div>
)

export default App
