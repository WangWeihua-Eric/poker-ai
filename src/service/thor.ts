import {Inject, Provide} from '@midwayjs/decorator';
import {INextOP, ISelfInfo} from '../interface';
import {ParseStreetService} from "./parseStreetService";
import {StreetEnum} from "../util/enum";

@Provide()
export class Thor {
  @Inject()
  parseStreetService: ParseStreetService;

  thorAction(selfInfo: ISelfInfo) {
    const nextOP: INextOP = {
      type: 'FOLD',
      value: 0,
    };

    const round = this.parseStreetService.getNowStreet(selfInfo)
    const callScore = selfInfo.callScore;
    switch (round) {
      case StreetEnum.FLOP:
        //  翻牌
        break
      default:
        //  翻前
        if(callScore) {
          nextOP.type = 'CALL';
          nextOP.value = callScore;
        } else {
          nextOP.type = 'RAISE';
          nextOP.value = 4;
        }
        break
    }

    return nextOP;
  }
}
