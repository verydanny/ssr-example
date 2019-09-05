import React from 'react'
import { asyncComponent } from '../../utils/async-component'
import style from './style.css'

const SomeAsyncComponent = asyncComponent(
  () => import('./other-component'),
  'HelloWorldTwo'
)

export const HelloWorld = () => (
  <div>
    <div className={style.bigBlue}>
      Hello World, <strong>Component</strong>
    </div>
    <SomeAsyncComponent />
  </div>
)
