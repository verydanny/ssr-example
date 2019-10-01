import React from 'react'
import { asyncComponent } from '../utils/async-component'
import { StaticContent, DeferHydrateToClient } from '../partial-hydrate'

const HelloWorldAsync = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "HelloWorld" */ '../components/hello-world/hello-world'
    ),
  () => require.resolveWeak('../components/hello-world/hello-world'),
  'HelloWorld',
  true
)

const Counter = asyncComponent(
  () =>
    import(/* webpackChunkName: "Counter" */ '../components/counter/counter'),
  () => require.resolveWeak('../components/hello-world/hello-world'),
  'Counter'
)

const CounterClient = DeferHydrateToClient(Counter)
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
