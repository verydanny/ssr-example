import Types from '@babel/types'
import { NodePath, Binding } from '@babel/traverse'

const FUNCTIONS_TO_PROCESS = ['makeAsyncComponent', 'makeAsyncModule']

export interface Options {
  webpack?: boolean
  packages?: string[]
}

interface State {
  processPackages?: Set<string>
  opts?: Options
}

module.exports = function asyncBabelPlugin({
  types: t
}: {
  types: typeof Types
}) {
  return {
    visitor: {
      Program(_path: NodePath<Types.Program>, state: State) {
        state.processPackages = new Set(
          (state.opts && state.opts.packages) || FUNCTIONS_TO_PROCESS
        )
      },
      ImportDeclaration(path: NodePath<Types.ImportDeclaration>, state: State) {
        const { processPackages } = state

        if (!(processPackages instanceof Set)) {
          return
        }

        const approvedFunctions = Array.from(processPackages)

        const specifiers = path.get('specifiers').filter(specifier => {
          return (
            specifier.isImportSpecifier() &&
            approvedFunctions.some(name =>
              specifier.get('imported').isIdentifier({ name })
            )
          )
        })

        if (specifiers.length === 0) {
          return
        }

        for (const importSpecifier of specifiers) {
          const bindingName = importSpecifier.node.local.name
          const binding = path.scope.getBinding(bindingName)

          if (binding != null) {
            addIdOption(binding, t, state.opts)
          }
        }
      }
    }
  }
}

function addIdOption(
  binding: Binding,
  t: typeof Types,
  { webpack = true }: Options = {}
) {
  binding.referencePaths.forEach(refPath => {
    const callExpression = refPath.parentPath

    if (!callExpression.isCallExpression()) {
      return
    }

    const args = callExpression.get('arguments')

    if (args.length === 0) {
      return
    }
  })
  // binding.referencePaths.forEach(refPath => {
  //   const callExpression = refPath.parentPath

  //   if (!callExpression.isCallExpression()) {
  //     return
  //   }

  //   const args = callExpression.get('arguments')
  //   if (args.length === 0) {
  //     return
  //   }

  //   const options = args[0]
  //   if (!options.isObjectExpression()) {
  //     return
  //   }

  //   const properties = options.get('properties')
  //   const propertiesMap: {
  //     [key: string]: NodePath<Types.ObjectMember>
  //   } = {}

  //   properties.forEach(property => {
  //     if (!property.isObjectMember() || property.node.computed) {
  //       return
  //     }

  //     const key = property.get('key') as NodePath

  //     if (!key.isIdentifier()) {
  //       return
  //     }

  //     propertiesMap[key.node.name] = property
  //   })

  //   const { id, load: loadProperty } = propertiesMap

  //   if (id != null || loadProperty == null) {
  //     return
  //   }

  //   const loaderMethod = loadProperty.isObjectProperty()
  //     ? loadProperty.get('value')
  //     : loadProperty.get('body')

  //   const dynamicImports: NodePath<Types.CallExpression>[] = []

  //   if (!Array.isArray(loaderMethod)) {
  //     loaderMethod.traverse({
  //       Import({ parentPath }) {
  //         if (parentPath.isCallExpression()) {
  //           dynamicImports.push(parentPath)
  //         }
  //       }
  //     })
  //   }

  //   if (!dynamicImports.length) {
  //     return
  //   }

  //   if (webpack) {
  //     loadProperty.insertAfter(
  //       t.objectProperty(
  //         t.identifier('id'),
  //         t.arrowFunctionExpression(
  //           [],
  //           t.callExpression(
  //             t.memberExpression(
  //               t.identifier('require'),
  //               t.identifier('resolveWeak')
  //             ),
  //             [dynamicImports[0].get('arguments')[0].node]
  //           )
  //         )
  //       )
  //     )
  //   } else {
  //     propertiesMap.load.insertAfter(
  //       t.objectProperty(
  //         t.identifier('id'),
  //         t.arrowFunctionExpression(
  //           [],
  //           t.callExpression(
  //             t.memberExpression(
  //               t.identifier('require'),
  //               t.identifier('resolve')
  //             ),
  //             [dynamicImports[0].get('arguments')[0].node]
  //           )
  //         )
  //       )
  //     )
  //   }
  // })
}
