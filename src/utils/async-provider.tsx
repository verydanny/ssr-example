import React from 'react'
import { Provider } from './async-context'

interface Props {
  updateChunk: (webpack: () => string | number) => void
}

export class AsyncChunkProvider extends React.Component<Props> {
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
