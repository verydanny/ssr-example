module.exports = {
  verbose: true,
  testMatch: ['**/*.test.{js,ts,jsx,tsx}'],
  collectCoverageFrom: ['**/src/**/*.{js,ts,jsx,tsx}'],
  coverageReporters: ['html'],
  coveragePathIgnorePatterns: [
    '<rootDir>/types/',
    '<rootDir>/webpack/',
    '<rootDir>/bin/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/lib/',
    '<rootDir>/babel/'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/types/',
    '<rootDir>/webpack/',
    '<rootDir>/bin/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/lib/',
    '<rootDir>/babel/'
  ],
  coverageDirectory: './coverage',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json']
}
