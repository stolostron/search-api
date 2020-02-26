/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */

const tapReporter = [
  'jest-tap-reporter',
  {
    logLevel: 'ERROR',
    showInternalStackTraces: true,
    filePath: 'test-output/jestTestLogs.tap',
  },
];

const jestConfig = {
  collectCoverage: true,
  coverageDirectory: './test-output/coverage',
  coverageReporters: [
    'json',
    'html',
    'lcov',
    'text',
  ],
  coverageThreshold: {
    global: {
      branches: 37,
      functions: 63,
      lines: 51,
      statements: 52,
    },
  },
  collectCoverageFrom: [
    'src/v2/**/*.{js,jsx}',
    '!src/**/mocks/*.js',
  ],
  testEnvironment: 'node',
  setupTestFrameworkScriptFile: './jest.setup.js',
};

jestConfig.reporters = process.env.TRAVIS ? ['default', tapReporter] : ['default'];

module.exports = jestConfig;
