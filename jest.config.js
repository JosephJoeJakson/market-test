export default {
    transform: {
      '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
    },
    testEnvironment: 'jsdom',
  };
  