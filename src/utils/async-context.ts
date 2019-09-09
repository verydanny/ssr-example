import React from 'react'

export const { Provider, Consumer } = React.createContext({
  updateChunk: (chunkName: string | number | symbol) => {}
})
