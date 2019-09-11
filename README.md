# SSR Chunking Solution

The goal was to create both a client and server that supports hot-reloading. This uses a more updated version of `loadable` that's typed out, and also uses the new `React.createContext()`.

- [SSR Chunking Solution](#ssr-chunking-solution)
  - [Features](#features)
  - [Installation](#installation)
  - [Caveats](#caveats)
  - [Credits](#credits)

## Features

**Development:**

- Simple to follow
- Typescript (woo)
- Hot reloading client AND server
  - Server supports hot reloading based on webpack entry. A good way to support it is through exporting middleware then bootstrapping your app with the bootstrap bundle.
  - See `src/server`
- In-memory filestem for server and client
  - Previously webpack-dev-middleware only worked on client side, and server-side in-memory has only worked if your server bundle is 1 file. This is because if you use `import()` then the in-memory filesystem would attempt to import from your real file-system so it would error. This is patched.
- Server doesn't have to restart unless you modify non-webpack server files.
  
**React:**

- Async components
- Resolution of async chunks on server side
  - Async chunks resolve before server starts, so no `<Loading/>` components server-side--same as `webpack-universal` and `loadable`.
  - When the client bundle needs chunk **ie:** `0.[hash].js`, it fetches that chunk. Wouldn't it be nice if the server knew that's the chunk it needed before the client-side code parsed the bundle? This solution handles all that for you.
- I didn't like how flimsy `webpack-universal` and `loadable` were because they either depended on too many config settings, or relied on `/* webpackChunkName: "foo" */` either with Babel plugins, or manually. ES modules don't have magic comments so I wanted to solve this through other means.
- No need for poorly supported webpack stats plugins. Both `loadable` and `webpack-universal` use webpack plugins to extract stats. This uses an existing **well supported** stats plugin to format the stats exactly how you need.
- Extracting CSS chunks/modules just work out-of-the-box.

## Installation

This package uses yarn so it assumes you have it installed.

- `yarn install` or `npm install`
- `yarn dev` or `npm run dev` for hot-reloading in-memory development.
- `yarn prod` or `npm run prod` to compile the production build
- `yarn start` to start up the production build

## Caveats

- You must export both client and server stats, but they're small...usually.
- Running the dev server with your webpack configs set to `mode: "production"` sometimes crashes the server. I am working on a solution to this.

## Credits

- React Loadable - https://github.com/jamiebuilds/react-loadable
- Webpack - https://github.com/webpack/webpack
