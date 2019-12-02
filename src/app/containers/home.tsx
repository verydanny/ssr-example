import React from 'react'
import { makeAsyncComponent } from '../../lib/async/asyncComponent'

interface HomeProps {
  name: string
}

const HelloWorldAsync = makeAsyncComponent(
  () => import('../components/hello-world/hello-world'),
  () => require.resolveWeak('../components/hello-world/hello-world'),
  {
    exportName: 'HelloWorld'
  }
)

export const Home = ({ name }: HomeProps) => {
  return (
    <>
      <HelloWorldAsync name="Binger" />
      <div>You&apos;re home now, {name}, dingus</div>
    </>
  )
}
