import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1641210158431_5686';

  // add your config here
  config.middleware = [];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };

  config.jwt = {
    enable: true,
    secret: 'test',
    ignore: ['/api/user/login'],
  };

  // config.security = {
  //   csrf: false,
  // };

  config.mongoose = {
    client: {
      uri: 'mongodb://localhost:27017/oj',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // user: '***********',
        // pass: '***********'
      }
    }
  }

  config.redis = {
    client: {
      port: 6379, // Redis port
      host: "127.0.0.1", // Redis host
      db: 1,
    },
  };
  return config;
};
