import React from 'react'

type MakePromise<T> = Promise<
  {
    [K in keyof T]: React.ComponentType<T[K]>
  }
>

export function asyncComponent<Props extends object, K extends keyof Props>(
  importComponent: () => MakePromise<Props>,
  exportName: K
) {
  return class AsyncComponent extends React.Component<Props[K], {}> {
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

      return C ? <C {...(this.props as Props[K])} /> : <div>Loading...</div>
    }
  }
}
