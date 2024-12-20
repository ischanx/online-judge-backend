import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
const os = require('os');
export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1641210158431_5686';

  // add your config here
  config.middleware = ['httpMiddleware'];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };

  config.jwt = {
    enable: true,
    secret: 'test',
    ignore: [
      '/api/user/login',
      '/api/user/register',
      '/api/user/registerEmail',
      '/api/user/confirmEmail',
      '/api/user/sendCode',
      '/api/user/profile',
      '/api/user/resetPassword',
      '/api/submission/update',
      '/api/file/upload',
    ],
  };

  // config.security = {
  //   csrf: false,
  // };

  config.mongoose = {
    client: {
      uri: 'mongodb://oj:oj@chanx.tech:27777/oj',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        // user: '***********',
        // pass: '***********'
      },
    },
  };

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      db: 1,
    },
  };

  config.JUDGE_TOKEN = 'preset token for authentication'; // 提前配置的评测机token，后端评测机管理需要
  config.IS_DEV = os.platform() === 'win32';
  config.MAIL_OPTIONS = {
    host: 'smtp.qiye.aliyun.com',
    port: 465,
    secure: true, // use TLS
    auth: {
      user: 'onlinejudge@chanx.tech', // 账号
      pass: '!onlinejudge123', // 授权码,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    // {string|Function} origin: '*',
    // {string|Array} allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };

  // config/config.default.js
  config.multipart = {
    fileSize: '500mb',
  };
  return config;
};
