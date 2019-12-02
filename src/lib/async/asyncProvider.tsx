import React from 'react'

import { AsyncChunkManager, UpdateChunk } from './asyncChunkManager'
import { Provider } from './asyncContext'

interface Props {
  updateChunk: UpdateChunk
}

export class AsyncChunkProvider extends React.PureComponent<Props> {
  render() {
    return (
      <Provider value={new AsyncChunkManager(this.props.updateChunk)}>
        {React.Children.only(this.props.children)}
      </Provider>
    )
  }
}
