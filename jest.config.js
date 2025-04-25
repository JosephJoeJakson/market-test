// jest.config.js
module.exports = {
    transform: {
      '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
    },
    testEnvironment: 'jsdom',
  };