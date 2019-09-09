import React from 'react'
import { asyncComponent } from '../../utils/async-component'
import style from './style.css'

const SomeAsyncComponent = asyncComponent(
  () => import(/* webpackChunkName: "HelloWorldTwo" */ './other-component'),
  'HelloWorldTwo',
  () => require.resolveWeak('./other-component')
)

export const HelloWorld = () => (
  <div>
    <div className={style.bigBlue}>
      Hello World, <strong>Component</strong>
    </div>
    <SomeAsyncComponent />
  </div>
)
