import React from 'react'
import { Route, Switch, NavLink } from 'react-router-dom'
import { makeAsyncComponent } from '../../lib/async/asyncComponent'
import StaticParagraph from '../containers/static'

const Home = makeAsyncComponent(
  () => import(/* webpackChunkName: 'home' */ '../containers/home'),
  () => require.resolveWeak('../containers/home'),
  { exportName: 'Home' }
)

const About = makeAsyncComponent(
  () => import(/* webpackChunkName: 'about' */ '../containers/about'),
  () => require.resolveWeak('../containers/about'),
  { exportName: 'About' }
)

export const Routes = () => {
  return (
    <>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
        <li>
          <NavLink to="/static">Static</NavLink>
        </li>
      </ul>
      <Switch>
        <Route exact path="/" render={() => <Home name="Marcus" />} />
        <Route path="/about" component={About} />
        <Route path="/static" component={StaticParagraph} />
      </Switch>
    </>
  )
}

Routes.displayName = 'Routes'
