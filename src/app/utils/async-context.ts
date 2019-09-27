import React from 'react'

export const { Provider, Consumer } = React.createContext({
  updateChunk: (webpack: () => string | number, isStatic: boolean) => {}
})
