import React, { useRef } from 'react'
import { HydrationContext } from './context'
import { HYDRATE_CONST } from './const'
import { isServer } from '../helpers/is-server'

interface Props<T> {
  id?: string
  children?: React.ReactNode
  componentRef?: {
    Component: React.ComponentType<T>
    props: T
  }
}

export const Hydrator = React.memo(function Hydrator<T>({
  children,
  id,
  componentRef
}: Props<T>) {
  const manager = React.useContext(HydrationContext)
  const hydrationId = useRef(manager.hydrationId(id)).current
  const currentHydration = manager.getHydration(hydrationId)
  const hydrationProps = { [HYDRATE_CONST]: hydrationId }

  if (children) {
    return <span {...hydrationProps}>{children}</span>
  }

  if (!children && !currentHydration && componentRef) {
    const { Component, props } = componentRef

    return <Component {...props} />
  }

  return (
    <span
      {...hydrationProps}
      dangerouslySetInnerHTML={{
        __html: manager.getHydration(hydrationId) || ''
      }}
    />
  )
})

Hydrator.displayName = 'Hydrator'

export function StaticContent<Props>(Component: React.ComponentType<Props>) {
  return function StaticContentWrap(props: Props) {
    const C: any = Component

    return isServer ? (
      <Hydrator>
        <C {...props} />
      </Hydrator>
    ) : (
      <Hydrator
        componentRef={{
          Component: C,
          props: props
        }}
      />
    )
  }
}
