export default {
    transform: {
      '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }],
    },
    extensionsToTreatAsEsm: ['.js'],
    testEnvironment: 'jsdom',
  };
  