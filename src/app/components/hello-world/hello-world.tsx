import React from 'react'
import style from './style.css'
import { StaticOne } from '../static-components/static-one'

export const HelloWorld = ({ name }: { name: string }) => (
  <div>
    <p className={style.bigBlue}>
      Hello, {name}, I&lsquo;m a <strong>static</strong> component
    </p>
    <p className={style.bigBlue}>
      I&apos;m not being <strong>hydrated</strong> because server already did
      that work
    </p>
    <StaticOne name="Orion" />
  </div>
)
