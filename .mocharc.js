'use strict';

module.exports = {
  require: ['esm'],
  'forbid-only': Boolean(process.env.CI),
  spec: 'test/**/*.spec.js'
};
