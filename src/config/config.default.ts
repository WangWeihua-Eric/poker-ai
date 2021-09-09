import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

const path = require('path');

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1629080536340_7331';

  // add your config here
  config.middleware = [];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };

  // 关闭 csrf
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // 配置跨域
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  config.logger = {
    dir: path.resolve(__dirname, '../../../fjkt-hela-log')
  }

  // config.security = {
  //   csrf: false,
  // };

  return config;
};
