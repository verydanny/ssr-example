import React, { useState } from 'react'

export const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Count</button>
    </>
  )
}
