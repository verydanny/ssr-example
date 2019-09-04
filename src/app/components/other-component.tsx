import React from 'react'
import { asyncComponent } from '../../utils/async-component'

const AsyncHelloWorld = asyncComponent(
  () => import('../async-components/hello-world-async'),
  'AsyncComponent'
)

export const HelloWorldTwo = () => (
  <div>
    <h1>This is HelloWorldTwo, loading Async Component Below!</h1>
    <AsyncHelloWorld name="Joe" />
  </div>
)
