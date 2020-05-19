/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.

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
      branches: 39,
      functions: 59,
      lines: 50,
      statements: 52,
    },
  },
  collectCoverageFrom: [
    'src/v2/**/*.{js,jsx}',
    '!src/**/mocks/*.js',
  ],
  testEnvironment: 'node',
  setupTestFrameworkScriptFile: './jest.setup.js',
  testResultsProcessor: 'jest-sonar-reporter',
};

jestConfig.reporters = process.env.TRAVIS ? ['default', tapReporter] : ['default'];

module.exports = jestConfig;
