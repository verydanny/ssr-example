/// <reference types="node" />
/// <reference types="jest" />

declare namespace NodeJS {
  export interface Global {
    __webpack_modules__: Record<string | number, object>
    __webpack_require__: jest.Mock
  }
}
