module.exports = {
  preset: '@react-native/jest-preset',
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 85,
      lines: 80,
      statements: 80,
    },
  },
};
