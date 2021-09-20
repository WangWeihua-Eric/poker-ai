import { Provide } from '@midwayjs/decorator';
import { ISelfInfo } from '../interface';
import { StreetEnum } from '../util/enum';

@Provide()
export class ParseStreetService {
  getNowStreet(selfInfo: ISelfInfo) {
    const round = selfInfo.round;
    switch (round) {
      case 'FLOP':
        return StreetEnum.FLOP;
      case 'TURN':
        return StreetEnum.TURN;
      case 'RIVER':
        return StreetEnum.RIVER;
      default:
        return StreetEnum.PREFLOP;
    }
  }
}
