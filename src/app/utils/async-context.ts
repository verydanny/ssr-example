import React from 'react'

export const AsyncChunkContext = React.createContext({
  updateChunk: (webpack: () => string | number, isStatic: boolean) => {}
})

export const { Consumer, Provider } = AsyncChunkContext
