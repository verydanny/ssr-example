import React from 'react'
import { asyncComponent } from '../../utils/async-component'
import style from './style.css'

const SomeAsyncComponent = asyncComponent(
  () => import('./foo-one'),
  'HelloWorldTwo',
  () => require.resolveWeak('./foo-one'),
  'foo-1'
)

const SomeOtherAsync = asyncComponent(
  () => import('./foo-two'),
  'HelloWorldTwo',
  () => require.resolveWeak('./foo-two'),
  'foo-2'
)

export const HelloWorld = () => (
  <div>
    <div className={style.bigBlue}>
      Hello World, <strong>Component</strong>
    </div>
    <SomeAsyncComponent />
    <SomeOtherAsync />
  </div>
)
