import React from 'react'
import { StaticContent } from '../../lib/partial-hydrate/partial'

export default function Dingus() {
  const StaticParagraph = StaticContent(() => (
    <p onClick={() => window.alert('Hey Paragraph')}>
      This is not going to be hydrated
    </p>
  ))

  return (
    <div>
      <button onClick={() => window.alert('Hey There')}>Button</button>
      <StaticParagraph />
    </div>
  )
}

Dingus.displayName = 'Dingus'
