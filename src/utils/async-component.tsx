import React from 'react'

type CycleProps<Props> = {
  readonly [x: string]: React.ComponentType<Props>
}

interface State<Props> {
  component: null | React.ComponentType<Props>
}

export function asyncComponent<Props extends {}>(
  importComponent: () => Promise<CycleProps<Props>>,
  exportName: string
) {
  return class AsyncComponent extends React.Component<Props, State<Props>> {
    state = {
      component: null
    }

    componentDidMount() {
      importComponent().then(cmp => {
        if (cmp[exportName]) {
          this.setState({
            component: cmp[exportName]
          })
        }
      })
    }

    render() {
      const C: any = this.state.component

      return C ? <C {...(this.props as Props)} /> : <div>Loading...</div>
    }
  }
}
