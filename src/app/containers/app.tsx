import React from 'react'
import { asyncComponent } from '../utils/async-component'
import { StaticContent } from '../partial-hydrate'
import { importClientDeferred } from '../partial-hydrate/defer-to-client'

const HelloWorldAsync = asyncComponent({
  importComponent: () =>
    import(
      /* webpackChunkName: "HelloWorld" */ '../components/hello-world/hello-world'
    ),
  webpack: () => require.resolveWeak('../components/hello-world/hello-world'),
  exportName: 'HelloWorld',
  isStatic: true
})

const CounterClient = importClientDeferred({
  importComponent: () =>
    import(/* webpackChunkName: "Counter" */ '../components/counter/counter'),
  webpack: () => require.resolveWeak('../components/counter/counter'),
  exportName: 'Counter'
})

const HelloWorld = StaticContent(HelloWorldAsync)

const App = () => {
  return (
    <div className="app-container">
      <CounterClient />
      <HelloWorld name="Daniel" />
    </div>
  )
}

export default App
