import React from 'react'
import { Provider } from './async-context'

interface Props {
  updateChunk: (webpack: () => string | number, isStatic: boolean) => void
}

export class AsyncChunkProvider extends React.Component<Props> {
  render() {
    return (
      <Provider
        value={{
          updateChunk: this.props.updateChunk
        }}
      >
        {React.Children.only(this.props.children)}
      </Provider>
    )
  }
}
