import React, { useRef } from 'react'
import { HydrationContext } from './context'
import { HYDRATE_CONST } from './const'
import { isServer } from '../utils/is-server'

interface Props {
  id?: string
  children?: React.ReactNode
}

export const Hydrator = React.memo(function Hydrator({ children, id }: Props) {
  const manager = React.useContext(HydrationContext)
  const hydrationId = useRef(manager.hydrationId(id)).current

  const hydrationProps = { [HYDRATE_CONST]: hydrationId }

  return children ? (
    <div {...hydrationProps}>{children}</div>
  ) : (
    <div
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
    return isServer ? (
      <Hydrator>
        <Component {...props} />
      </Hydrator>
    ) : (
      <Hydrator />
    )
  }
}
