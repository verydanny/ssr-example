export function isServerFunc() {
  return !(typeof window != 'undefined' && window.document)
}

export const isServer = isServerFunc()
