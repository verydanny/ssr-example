import React from 'react'

import { AsyncChunkManager, ModuleIdFunc } from './asyncChunkManager'

const updateChunkStub = (_id: ModuleIdFunc, _isStatic: boolean) => {
  // void
}

export const AsyncChunkContext = React.createContext(
  new AsyncChunkManager(updateChunkStub)
)

export const { Consumer, Provider } = AsyncChunkContext
