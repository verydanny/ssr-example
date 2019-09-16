import React from 'react'
import style from './async-style.css'
import { add } from 'rambda'

const someAdd = add(1)

export const FooOne = ({ on }: { on: boolean }) => (
  <div>
    <h1 className={style.bigAsync}>Hi there, I&lsquo;m some {on}dude</h1>
    <p>
      <strong>I can hot reload really quick, {someAdd(2)}</strong>
    </p>
  </div>
)
