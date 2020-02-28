import React from 'react'

import { AsyncChunkManager } from './asyncChunkManager'

export const AsyncChunkContext = React.createContext(new AsyncChunkManager())
