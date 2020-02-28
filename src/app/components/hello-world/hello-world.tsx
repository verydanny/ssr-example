import React from 'react'
import style from './style.css'

export const HelloWorld = ({ name }: { name: string }) => (
  <div>
    <p className={style.bigBlue}>
      Hello, {name}, I&lsquo;m a <strong>static</strong> component
    </p>
    <p className={style.bigBlue}>
      I&apos;m not being <strong>hydrated</strong> because server already did
      that works
    </p>
  </div>
)

HelloWorld.displayName = 'HelloWorld'
