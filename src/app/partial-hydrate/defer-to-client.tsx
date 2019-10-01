import React, { useEffect, useState } from 'react'
import { useHydrationManager } from './hooks'

export const DeferredComponent: React.FunctionComponent = ({ children }) => {
  const manager = useHydrationManager()
  const [hydrated, setHydrated] = useState(manager.hydrated)

  useEffect(() => setHydrated(manager.hydrated), [manager])

  return manager.isServer ? null : hydrated ? <>{children}</> : null
}

export function DeferHydrateToClient<K, T extends React.ComponentType<K>>(
  Component: T
): React.MemoExoticComponent<React.ComponentType<K>> {
  const C: any = Component

  function DeferredComponentHOC(props: K) {
    return (
      <DeferredComponent>
        <C {...props} />
      </DeferredComponent>
    )
  }

  return React.memo(DeferredComponentHOC)
}
