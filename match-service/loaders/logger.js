const pino = require('pino');

const devConfig = {
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
};

const testConfig = {
  level: 'silent'
};

const prodConfig = {
  level: 'info'
};

let config;
if (process.env.NODE_ENV === 'test') {
  config = testConfig;
} else if (process.env.NODE_ENV === 'production') {
  config = prodConfig;
} else {
  config = devConfig;
}

module.exports = pino(config);
