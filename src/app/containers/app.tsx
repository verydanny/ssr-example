import React from 'react'
import { asyncComponent } from '../../lib/async/async-component'
import { StaticContent } from '../../lib/partial-hydrate'

const HelloWorldAsync = asyncComponent({
  importComponent: () => import('../components/hello-world/hello-world'),
  webpack: () => require.resolveWeak('../components/hello-world/hello-world'),
  exportName: 'HelloWorld'
})

const App = () => {
  return (
    <div className="app-container">
      <HelloWorldAsync name="Dan" />
    </div>
  )
}

export default App
