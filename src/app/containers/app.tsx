import React from 'react'
import { Routes } from '../routes/routes'

interface AppProps {
  context: object
}

const App = ({ context }: AppProps) => {
  return (
    <div className="app-container">
      <Routes />
    </div>
  )
}

App.displayName = 'App'

export default App
