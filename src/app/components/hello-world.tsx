import React from 'react'

import('rambdax').then((R: typeof import('rambdax')) => {
  const addTen = (x: number) => x + 10
  const subtractOne = (x: number) => x - 1
  console.log(
    R.compose(
      addTen,
      subtractOne
    )(20)
  )
})

export const HelloWorld = () => (
  <div> Hello World, fams. Breh everything is working</div>
)
