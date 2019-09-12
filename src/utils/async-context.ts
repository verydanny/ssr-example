import React from 'react'

export const Context = React.createContext({
  updateChunk: (webpack: () => string | number) => {}
})

export const { Consumer, Provider } = Context
