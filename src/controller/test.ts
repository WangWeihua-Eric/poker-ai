import {Inject, Controller, Provide, Get} from '@midwayjs/decorator';
import {Context} from 'egg';

@Provide()
@Controller('/test')
export class TestController {
  @Inject()
  ctx: Context;

  @Get('/test')
  test() {
    return {
      state: {
        code: '0',
        msg: 'ok'
      },
      data: {
        test:
          {
            value: true
          }
      }
    };
  }
}
