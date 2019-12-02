module.exports = {
  parserOptions: {
    ecmaVersion: '2018',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'prettier'
  ],
  extends: [
    'plugin:react/recommended',
    'prettier',
    'prettier/react'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    es6: true,
    node: true
  },
  rules: {
    'prettier/prettier': ['error', {
      singleQuote: true,
      semi: false,
      bracketSpacing: true
    }],
    'react/prop-types': 0
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
      ],
      rules: {
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-use-before-define': 0,
        '@typescript-eslint/no-unused-vars': ['error', {
          args: 'after-used',
          argsIgnorePattern: '^_'
        }]
      },
    }
  ]
}
