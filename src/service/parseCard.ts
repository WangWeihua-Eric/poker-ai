import { Provide } from '@midwayjs/decorator';
import { ISelfInfo } from '../interface';

@Provide()
export class ParseCard {
  /**
   * 判断翻前牌型是否有利
   */
  isGoodCardInPreFlop(selfInfo: ISelfInfo) {
    let cardFaceGood = false;
    const {
      leftCardWithDeleteColor,
      rightCardWithDeleteColor,
      leftCardColor,
      rightCardColor,
    } = this.getBaseCardInfo(selfInfo);
    if (leftCardWithDeleteColor === rightCardWithDeleteColor) {
      // 口袋对
      cardFaceGood = true;
    } else if (leftCardWithDeleteColor > 10 && rightCardWithDeleteColor > 10) {
      // 所有牌均大于 T
      cardFaceGood = true;
    } else if (
      leftCardColor === rightCardColor &&
      [leftCardWithDeleteColor, rightCardWithDeleteColor].includes(14)
    ) {
      // AX 花
      cardFaceGood = true;
    } else if (
      leftCardColor === rightCardColor &&
      [10, 11, 12, 13, 14].includes(leftCardWithDeleteColor) &&
      [10, 11, 12, 13, 14].includes(rightCardWithDeleteColor)
    ) {
      // 皇同
      cardFaceGood = true;
    }
    return cardFaceGood;
  }

  /**
   * 判断当前手牌在翻前是否可以主动下注
   */
  canRaiseInPreFlop(selfInfo: ISelfInfo) {
    let canRaise = false;
    if (this.isGoodCardInPreFlop(selfInfo)) {
      const {
        leftCardWithDeleteColor,
        rightCardWithDeleteColor,
        leftCardColor,
        rightCardColor,
      } = this.getBaseCardInfo(selfInfo);
      if (leftCardWithDeleteColor > 9 && rightCardWithDeleteColor > 9) {
        canRaise = true;
      } else if (leftCardColor === rightCardColor) {
        // AX 花
        canRaise = true;
      }
    }
    return canRaise;
  }

  /**
   * 判断当前手牌在翻前是否可以在对手 raise 后进行 bet
   */
  canBetAfterRaise(selfInfo: ISelfInfo) {
    let canBetAfterRaise = false;
    if (this.canRaiseInPreFlop(selfInfo)) {
      const { leftCardWithDeleteColor, rightCardWithDeleteColor } =
        this.getBaseCardInfo(selfInfo);
      if (
        leftCardWithDeleteColor === rightCardWithDeleteColor &&
        [12, 13, 14].includes(leftCardWithDeleteColor)
      ) {
        // AA、KK、QQ
        canBetAfterRaise = true;
      } else if (
        [13, 14].includes(leftCardWithDeleteColor) &&
        [13, 14].includes(leftCardWithDeleteColor)
      ) {
        // AK
        canBetAfterRaise = true;
      }
    }
    return canBetAfterRaise;
  }

  getBaseCardInfo(selfInfo: ISelfInfo) {
    const handCards = selfInfo.handCards;
    const leftCard = handCards[0];
    const rightCard = handCards[1];
    const leftCardWithDeleteColorStr = this.deleteColor(leftCard);
    const rightCardWithDeleteColorStr = this.deleteColor(rightCard);
    const leftCardWithDeleteColor =
      leftCardWithDeleteColorStr === '01'
        ? 14
        : parseInt(leftCardWithDeleteColorStr, 10);
    const rightCardWithDeleteColor =
      rightCardWithDeleteColorStr === '01'
        ? 14
        : parseInt(rightCardWithDeleteColorStr, 10);
    const leftCardColor = this.getColor(leftCard);
    const rightCardColor = this.getColor(rightCard);
    return {
      handCards,
      leftCard,
      rightCard,
      leftCardWithDeleteColorStr,
      rightCardWithDeleteColorStr,
      leftCardWithDeleteColor,
      rightCardWithDeleteColor,
      leftCardColor,
      rightCardColor,
    };
  }

  /**
   * 去掉花色
   */
  deleteColor(card) {
    let cardWithDeleteColor = card.toString();
    cardWithDeleteColor = cardWithDeleteColor.substr(1);
    return cardWithDeleteColor.toString();
  }

  /**
   * 获取花色
   */
  getColor(card) {
    let cardWithGetColor = card.toString();
    cardWithGetColor = cardWithGetColor[0];
    return cardWithGetColor.toString();
  }
}
