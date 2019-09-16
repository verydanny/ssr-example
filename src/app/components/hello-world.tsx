import React from 'react'
import { asyncComponent } from '../../utils/async-component'
import style from './style.css'

const SomeAsyncComponent = asyncComponent(
  () => import('./foo-one'),
  () => require.resolveWeak('./foo-one'),
  'FooOne'
)

const SomeOtherAsync = asyncComponent(
  () => import('./foo-two'),
  () => require.resolveWeak('./foo-two'),
  'FooTwo'
)

export const HelloWorld = () => (
  <div>
    <div className={style.bigBlue}>
      Hello World, <strong>Component</strong>
    </div>
    <SomeAsyncComponent on={false} />
    <SomeOtherAsync />
  </div>
)
