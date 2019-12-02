import {
  createLoader,
  allAsyncChunks,
  allProcessedChunks,
  preloadAll,
  preloadReady
} from '../asyncLoader'

const mockModuleDefaultExport = jest.fn(x => `Hello ${x}`)
const mockRequire = jest.fn(() => {})

jest.mock('./dynamicImportMockOne', () => mockModuleDefaultExport)
jest.mock('./dynamicImportMockTwo', () => mockModuleDefaultExport)

beforeEach(() => {
  allAsyncChunks.clear()
  allProcessedChunks.clear()

  const dynamicImportMockOneId = require.resolve('./dynamicImportMockOne')
  const dynamicImportMockTwoId = require.resolve('./dynamicImportMockTwo')

  // This simulates ESmodule dynamic imports because Commonjs `require` are
  // cached in memory. So we delete from memory cache, and then test if it's still
  // resolved
  delete require.cache[dynamicImportMockOneId]
  delete require.cache[dynamicImportMockTwoId]
})

describe('createLoader', () => {
  describe('Proper ID function', () => {
    test('CreateLoader<T>.attemptSync toBe true', () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )

      expect(loaderState.attemptSync).toBe(true)
    })

    test('CreateLoader<T>.resolved toBe function', () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )

      expect(typeof loaderState.resolved).toBe('function')
    })

    test('CreateLoader<T>.resolved toBe correct Call Expression', async () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )

      if (loaderState.resolved) {
        loaderState.resolved('World')
      }

      expect(mockModuleDefaultExport).toHaveBeenCalled()
    })
  })

  describe('Improper ID function (not a resolver, just a string/number)', () => {
    test('CreateLoader<T>.resolved = undefined; loaderState.attemptSync = false;', () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => 'NOOP'
      )

      expect(
        typeof loaderState.resolved === 'undefined' && loaderState.attemptSync
      ).toBe(true)
    })

    test('CreateLoader<T>.resolve is a Promise', () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )

      expect(loaderState.resolve().constructor.name).toBe('Promise')
    })

    test('CreateLoader<T>.resolved toBe typeof function', async () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => 'NOOP'
      )

      await loaderState.resolve()

      expect(typeof loaderState.resolved).toBe('function')
    })

    test('CreateLoader<T>.resolved toBe correct Call Expression', async () => {
      const loaderState = createLoader(
        () => import('./dynamicImportMockOne'),
        () => 'NOOP'
      )

      await loaderState.resolve()

      if (loaderState.resolved) {
        loaderState.resolved('Fred')
      }

      expect(typeof loaderState.resolved).toBe('function')
    })
  })

  describe('Caching modules', () => {
    test('If two identical imports, cache first, if first resolved, return original resolution', async () => {
      const loadOne = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )

      await loadOne.resolve()
      delete require.cache[require.resolve('./dynamicImportMockOne')]

      const loadTwo = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )

      expect(loadTwo.resolved).toEqual(mockModuleDefaultExport)
    })
  })

  describe('Webpack function', () => {
    beforeEach(() => {
      // Mock a basic webpack __webpack_modules__ framework
      const id = require.resolve('./dynamicImportMockOne')

      global.__webpack_require__ = mockRequire
      global.__webpack_modules__ = {
        [id]: require(id)
      }

      require.resolveWeak = require.resolve
    })

    afterEach(() => {
      delete global.__webpack_require__
      delete global.__webpack_modules__
      delete require.resolveWeak
      delete require.cache[require.resolve('./dynamicImportMockOne')]
    })

    test('Does webpack import when available', () => {
      createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolveWeak('./dynamicImportMockOne')
      )

      expect(mockRequire).toHaveBeenCalled()
    })

    test('If two identical imports, cache first, if first resolved, return original resolution', async () => {
      const loaderStateOne = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolveWeak('./dynamicImportMockOne')
      )

      await loaderStateOne.resolve()
      delete require.cache[require.resolve('./dynamicImportMockOne')]

      const loaderStateTwo = createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolveWeak('./dynamicImportMockOne')
      )

      expect(loaderStateTwo.resolved).toEqual(mockModuleDefaultExport)
    })
  })

  describe('Flushing async imports Node', () => {
    test('moduleMap is accurate', async () => {
      createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )
      createLoader(
        () => import('./dynamicImportMockTwo'),
        () => require.resolve('./dynamicImportMockTwo')
      )

      expect(allAsyncChunks.size).toBe(2)
      expect(allProcessedChunks.size).toBe(0)
    })

    test('preloadAll resolves all undefined resolved', async () => {
      createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolve('./dynamicImportMockOne')
      )
      createLoader(
        () => import('./dynamicImportMockTwo'),
        () => require.resolve('./dynamicImportMockTwo')
      )

      await preloadAll()

      expect(
        Array.from(allAsyncChunks).every(
          ([, loaderState]) => typeof loaderState.resolved !== 'undefined'
        )
      ).toBe(true)
    })
  })

  describe('Flushing imports Webpack env', () => {
    beforeEach(() => {
      const id = require.resolve('./dynamicImportMockOne')

      global.__webpack_require__ = mockRequire

      // Only 1 module is technically ready, so we should see 2 async modules
      // in allAsyncChunk, and 1 async module in allProcessedChunks
      global.__webpack_modules__ = {
        [id]: require(id)
      }

      require.resolveWeak = require.resolve
    })

    afterEach(() => {
      delete global.__webpack_require__
      delete global.__webpack_modules__
      delete require.resolveWeak
      delete require.cache[require.resolve('./dynamicImportMockOne')]
    })

    test('moduleMap is accurate', () => {
      createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolveWeak('./dynamicImportMockOne')
      )
      createLoader(
        () => import('./dynamicImportMockTwo'),
        () => require.resolveWeak('./dynamicImportMockTwo')
      )

      expect(allAsyncChunks.size).toBe(2)
      expect(allProcessedChunks.size).toBe(1)
    })

    test('preloadReady flushes ready modules', async () => {
      createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolveWeak('./dynamicImportMockOne')
      )
      createLoader(
        () => import('./dynamicImportMockTwo'),
        () => require.resolveWeak('./dynamicImportMockTwo')
      )

      await preloadReady()

      expect(
        Array.from(allProcessedChunks).every(
          ([, loaderState]) => typeof loaderState.resolved !== 'undefined'
        )
      ).toBe(true)
    })

    test('Both preloadReady and preloadAll resolve CreateLoader<T>.resolved', async () => {
      createLoader(
        () => import('./dynamicImportMockOne'),
        () => require.resolveWeak('./dynamicImportMockOne')
      )
      createLoader(
        () => import('./dynamicImportMockTwo'),
        () => require.resolveWeak('./dynamicImportMockTwo')
      )

      await preloadReady()
      await preloadAll()

      expect(
        Array.from(allAsyncChunks).every(
          ([, loaderState]) => typeof loaderState.resolved !== 'undefined'
        )
      ).toBe(true)
      expect(
        Array.from(allProcessedChunks).every(
          ([, loaderState]) => typeof loaderState.resolved !== 'undefined'
        )
      ).toBe(true)
    })
  })
})
