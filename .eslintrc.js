module.exports = {
  "plugins": ["jest"],
  "extends": ["plugin:jest/recommended", "airbnb-base"],
  "rules": {
    "no-param-reassign": ["error", { "props": true, "ignorePropertyModificationsFor": ["accum", "req"] }],
    "max-len": ["error", { "code": 125 }]
  }
};