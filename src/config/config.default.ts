import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

import { HTTP_STATUS } from '../extend/const';
const path = require('path');

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1615798154767_1353';

  // add your config here
  config.middleware = [];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: false
  }

  config.bodyParser = {
    formLimit: '30mb',
    jsonLimit: '30mb',
    textLimit: '30mb',
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
  // 统一异常处理
  config.onerror = {
    json(err, ctx) {
      ctx.logger.error(err);
      ctx.body = { state: HTTP_STATUS.error, data: JSON.stringify(err) };
      ctx.status = 500;
    },
  }
  config.logger = {
    dir: path.resolve(__dirname, '../../../business-hs-middlelayer-node-log')
  }

  return config;
};

