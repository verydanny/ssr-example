import React from 'react'
import { Counter } from '../components/counter/counter'
import { asyncComponent } from '../utils/async-component'
import { StaticContent, HydrationTracker } from '../partial-hydrate'

const HelloWorldAsync = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "HelloWorld" */ '../components/hello-world/hello-world'
    ),
  () => require.resolveWeak('../components/hello-world/hello-world'),
  'HelloWorld',
  true
)

const HelloWorld = StaticContent(HelloWorldAsync)

const App = () => {
  return (
    <div className="app-container">
      <HydrationTracker />
      <HelloWorld name="bingus" />
      <Counter />
    </div>
  )
}

export default App
