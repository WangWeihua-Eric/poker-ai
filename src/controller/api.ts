import {
  Inject,
  Controller,
  Post,
  Provide,
  Query,
  Get,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { IGetUserResponse } from '../interface';
import { UserService } from '../service/user';

@Provide()
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Post('/get_user')
  async getUser(@Query() uid: string): Promise<IGetUserResponse> {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  @Get('/test')
  test() {
    return { success: true, message: 'OK', data: { hhh: 111 } };
  }

  @Get('/healthcheck')
  async healthcheck() {
    this.ctx.status = 200;
    this.ctx.body = 'success';
  }
}
