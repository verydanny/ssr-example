import React from 'react'
import style from './async-style.css'

export const HelloWorldTwo = ({ on }: { on: boolean }) => (
  <div>
    <h1 className={style.bigAsync}>Hi there, I&lsquo;m some {on}dude</h1>
    <p>
      <strong>I can hot reload really quick</strong>
    </p>
  </div>
)
