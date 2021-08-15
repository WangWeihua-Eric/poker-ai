import { App, Configuration } from '@midwayjs/decorator';
import { ILifeCycle } from '@midwayjs/core';
import { Application } from 'egg';
import * as typegoose from '@midwayjs/typegoose';
const segApolloClient = require('@hs/seg-egg-apollojs');

@Configuration(({
  imports: [
    typegoose
  ]
}))
export class ContainerLifeCycle implements ILifeCycle {

  @App()
  app: Application;

  async onReady() {
    // 把apollo注入全局对象
    await segApolloClient.init(this.app.config.apollo);
  }
}
