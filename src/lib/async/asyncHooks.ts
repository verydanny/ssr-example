import { useContext, useState, useCallback } from 'react'

import { useMountedRef } from '../hooks/useMounted'
import { AsyncChunkContext } from './asyncContext'

export function useAsyncChunkContext() {
  return useContext(AsyncChunkContext)
}

export function useAsyncHook<T>(
  loaderState: import('./asyncLoader').CreateLoader<T>,
  isStatic: boolean
) {
  const [value, setValue] = useState<T | Error | null>(() =>
    // We want to do an instant resolve on SSR
    typeof loaderState.resolved !== 'undefined' ? loaderState.resolved : null
  )
  const mounted = useMountedRef()
  const asyncChunkManager = useAsyncChunkContext()

  const load = useCallback(async () => {
    if (value != null) {
      return value
    }

    try {
      const resolved = await loaderState.resolve()

      if (mounted.current) {
        setValue(() => resolved)
      }
    } catch (error) {
      if (mounted.current) {
        setValue(() => error)
      }

      return error
    }
  }, [mounted, loaderState, value])

  const { id } = loaderState

  if (loaderState.id) {
    asyncChunkManager.recordChunk(loaderState.id, isStatic)
  }

  return value instanceof Error
    ? { id, resolved: null, error: value, loading: false, load }
    : { id, resolved: value, error: null, loading: value == null, load }
}
