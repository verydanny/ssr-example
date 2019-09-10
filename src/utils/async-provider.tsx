import React from 'react'
import { Provider } from './async-context'

interface Props {
  updateChunk: (
    chunkName: string | number | symbol,
    webpack: () => string
  ) => void
}

interface State {
  updateChunk: (chunkName: string | number | symbol) => void
}

export class AsyncChunkProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
  }

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
