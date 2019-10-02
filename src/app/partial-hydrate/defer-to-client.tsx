import React, { useEffect, useState, useContext } from 'react'
import { useHydrationManager } from './hooks'
import { asyncComponent } from '../utils/async-component'
import { AsyncChunkContext } from '../utils/async-context'

type DefaultOrNamedExport =
  | {
      readonly [x: string]: any
    }
  | { readonly default: any }

type ResolvedPromise<T extends DefaultOrNamedExport> = {
  [K in keyof T]: React.ComponentType<T[K]>
}

interface DeferredComponentProps {
  resolver?: () => string | number
}

export const DeferredComponent: React.FunctionComponent<
  DeferredComponentProps
> = ({ children, resolver }) => {
  const manager = useHydrationManager()
  const [hydrated, setHydrated] = useState(manager.hydrated)

  if (resolver) {
    const { updateChunk } = useContext(AsyncChunkContext)
    updateChunk(resolver, false)
  }

  useEffect(() => setHydrated(manager.hydrated), [manager])

  return manager.isServer ? null : hydrated ? <>{children}</> : null
}

export function DeferHydrateToClient<
  Props,
  T extends React.ComponentType<Props>
>(
  Component: T,
  resolver?: () => string | number
): React.MemoExoticComponent<React.ComponentType<Props>> {
  const C: any = Component

  function DeferredComponentHOC(props: Props) {
    return (
      <DeferredComponent resolver={resolver ? resolver : undefined}>
        <C {...props} />
      </DeferredComponent>
    )
  }

  return React.memo(DeferredComponentHOC)
}

export function importClientDeferred<
  Exports extends object,
  K extends keyof ResolvedPromise<Exports>
>({
  importComponent,
  webpack,
  exportName,
  isStatic
}: {
  importComponent: () => Promise<Exports>
  webpack: () => string | number
  exportName: K | 'default'
  isStatic?: boolean
}) {
  return DeferHydrateToClient(
    asyncComponent({
      importComponent,
      webpack,
      exportName,
      isStatic
    }),
    webpack
  )
}
