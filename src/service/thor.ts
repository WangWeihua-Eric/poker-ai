import { Provide } from '@midwayjs/decorator';
import { INextOP } from '../interface';

@Provide()
export class Thor {
  thorAction() {
    const nextOP: INextOP = {
      type: 'FOLD',
      value: 0,
    };
    return nextOP;
  }
}
