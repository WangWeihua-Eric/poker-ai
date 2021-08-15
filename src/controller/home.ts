import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
  @Get('/test')
  async test() {
    return { state: { code: 0, message: '111' } };
  }
}
