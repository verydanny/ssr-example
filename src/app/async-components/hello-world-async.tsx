import style from './style.css'
import React from 'react'

interface Props {
  name?: string
}

export class AsyncComponent extends React.Component<Props> {
  render() {
    return <h1 className={style.bigRed}>Hey there, {this.props.name}</h1>
  }
}
