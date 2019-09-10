import React from 'react'
import style from './style.css'

export const HelloWorldTwo = ({ on }: { on: boolean }) => (
  <div>
    <h1 className={style.bigH}>Hi there, I&lsquo;m some {on}dude</h1>
  </div>
)
