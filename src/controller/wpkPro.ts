import {
  Inject,
  Controller,
  Provide,
  Post,
  ALL,
  Body,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { ISelfInfo } from '../interface';
import { WpkProService } from '../service/wpkPro';

@Provide()
@Controller('/wpkpro')
export class WpkProController {
  @Inject()
  ctx: Context;

  @Inject()
  wpkProService: WpkProService;

  @Post('/getnextop')
  getNextOperating(@Body(ALL) selfInfo: ISelfInfo) {
    console.log('selfInfo: ', JSON.stringify(selfInfo));

    return {
      state: {
        code: '0',
        msg: 'ok',
      },
      data: this.wpkProService.getNextOP(selfInfo),
    };
  }
}
