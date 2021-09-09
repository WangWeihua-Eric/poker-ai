import {Provide} from '@midwayjs/decorator';
import {INextOP, ISelfInfo} from '../interface';
import {CardTypeEnum} from "../util/enum";

@Provide()
export class WpkProService {
  getNextOP(selfInfo: ISelfInfo): INextOP {
    const nextOP: INextOP = {
      type: 'FOLD',
      value: 0
    }
    const sitUserList = selfInfo.sitUserList
    const userId = selfInfo.userId
    const isPosGood = this.isPosGood(sitUserList, userId)
    const isCardFaceGood = this.isCardFaceGood(selfInfo)
    const canActionList = selfInfo.canActionList
    const totalPot = selfInfo.totalPot
    const callScore = selfInfo.callScore
    if (isPosGood && isCardFaceGood) {
      // 建议激进
      // 检查翻前是否是一等牌力
      if(this.checkMaxCards(selfInfo)) {
        if (canActionList.includes('RAISE')) {
          const raiseNumber = totalPot
          if (raiseNumber >= selfInfo.maxRaiseScore) {
            nextOP.type = 'ALL_IN'
            nextOP.value = selfInfo.maxRaiseScore
          } else if (raiseNumber <= selfInfo.minRaiseScore) {
            nextOP.type = 'RAISE'
            nextOP.value = selfInfo.minRaiseScore
          } else {
            nextOP.type = 'RAISE'
            nextOP.value = raiseNumber
          }
        } else if (canActionList.includes('ALL_IN')) {
          nextOP.type = 'ALL_IN'
          nextOP.value = selfInfo.maxRaiseScore
        } else if (canActionList.includes('CALL')) {
          nextOP.type = 'CALL'
          nextOP.value = callScore
        }
      } else {
        const round = selfInfo.round
        switch (round) {
          case 'FLOP':
          case 'TURN':
          case 'RIVER':
            if (canActionList.includes('RAISE')) {
              const raiseNumber = Math.round(totalPot / 3 * 2)
              if (raiseNumber >= selfInfo.maxRaiseScore) {
                nextOP.type = 'ALL_IN'
                nextOP.value = selfInfo.maxRaiseScore
              } else if (raiseNumber <= selfInfo.minRaiseScore) {
                nextOP.type = 'RAISE'
                nextOP.value = selfInfo.minRaiseScore
              } else {
                nextOP.type = 'RAISE'
                nextOP.value = raiseNumber
              }
            } else if (canActionList.includes('ALL_IN')) {
              nextOP.type = 'ALL_IN'
              nextOP.value = selfInfo.maxRaiseScore
            } else if (canActionList.includes('CALL')) {
              nextOP.type = 'CALL'
              nextOP.value = callScore
            }
            break
          default:
            if (callScore) {
              if (callScore < totalPot * 5 / 2) {
                nextOP.type = 'CALL'
                nextOP.value = callScore
              }
            } else if (canActionList.includes('RAISE')) {
              const raiseNumber = Math.round(totalPot / 3 * 2)
              if (raiseNumber >= selfInfo.maxRaiseScore) {
                nextOP.type = 'ALL_IN'
                nextOP.value = selfInfo.maxRaiseScore
              } else if (raiseNumber <= selfInfo.minRaiseScore) {
                nextOP.type = 'RAISE'
                nextOP.value = selfInfo.minRaiseScore
              } else {
                nextOP.type = 'RAISE'
                nextOP.value = raiseNumber
              }
            }
            break
        }
      }
    } else if (!isPosGood && isCardFaceGood) {
      // 可以激进
      // 检查翻前是否是一等牌力
      if(this.checkMaxCards(selfInfo)) {
        if (canActionList.includes('RAISE')) {
          const raiseNumber = totalPot
          if (raiseNumber >= selfInfo.maxRaiseScore) {
            nextOP.type = 'ALL_IN'
            nextOP.value = selfInfo.maxRaiseScore
          } else if (raiseNumber <= selfInfo.minRaiseScore) {
            nextOP.type = 'RAISE'
            nextOP.value = selfInfo.minRaiseScore
          } else {
            nextOP.type = 'RAISE'
            nextOP.value = raiseNumber
          }
        } else if (canActionList.includes('ALL_IN')) {
          nextOP.type = 'ALL_IN'
          nextOP.value = selfInfo.maxRaiseScore
        } else if (canActionList.includes('CALL')) {
          nextOP.type = 'CALL'
          nextOP.value = callScore
        }
      } else if (callScore) {
        nextOP.type = 'CALL'
        nextOP.value = callScore
      } else if (canActionList.includes('RAISE')) {
        const raiseNumber = Math.round(totalPot / 2)
        if (raiseNumber >= selfInfo.maxRaiseScore) {
          nextOP.type = 'ALL_IN'
          nextOP.value = selfInfo.maxRaiseScore
        } else if (raiseNumber <= selfInfo.minRaiseScore) {
          nextOP.type = 'RAISE'
          nextOP.value = selfInfo.minRaiseScore
        } else {
          nextOP.type = 'RAISE'
          nextOP.value = raiseNumber
        }
      }
    } else if (isPosGood && !isCardFaceGood) {
      // 建议被动，pre flop 小于 1/2 ，flop 小于 1/3，其余直接扔了
      if (callScore) {
        const round = selfInfo.round
        switch (round) {
          case 'FLOP':
            if (callScore < totalPot / 4) {
              nextOP.type = 'CALL'
              nextOP.value = callScore
            }
            break
          case 'TURN':
            break
          case 'RIVER':
            break
          default:
            if (callScore < totalPot / 3) {
              nextOP.type = 'CALL'
              nextOP.value = callScore
            }
            break
        }
      } else {
        nextOP.type = 'CHECK'
        nextOP.value = 0
      }
    } else {
      if (callScore) {
        // 弃牌
        nextOP.type = 'FOLD'
        nextOP.value = 0
      } else {
        nextOP.type = 'CHECK'
        nextOP.value = 0
      }
    }
    return nextOP
  }

  /**
   * 检查是否是一等牌力
   * @param selfInfo
   */
  checkMaxCards(selfInfo: ISelfInfo) {
    let maxCards = false
    const round = selfInfo.round
    switch (round) {
      case 'FLOP':
        break
      case 'TURN':
        break
      case 'RIVER':
        break
      default:
        const handCards = selfInfo.handCards
        const leftCard = handCards[0]
        const rightCard = handCards[1]
        const leftCardWithDeleteColor = this.deleteColor(leftCard) === '01' ? 14 : parseInt(this.deleteColor(leftCard), 10)
        const rightCardWithDeleteColor = this.deleteColor(rightCard) === '01' ? 14 : parseInt(this.deleteColor(rightCard), 10)
        if ((leftCardWithDeleteColor > 12 && rightCardWithDeleteColor > 12) || (leftCardWithDeleteColor === rightCardWithDeleteColor && leftCardWithDeleteColor === 12)) {
          maxCards = true
        }
        break
    }

    return maxCards
  }

  /**
   * 判断当前牌面对我是否有利
   * @param selfInfo
   */
  isCardFaceGood(selfInfo: ISelfInfo) {
    let cardFaceGood = false
    const round = selfInfo.round
    const cardType = selfInfo.cardType
    const dealPublicCards = selfInfo.dealPublicCards
    const handCards = selfInfo.handCards
    const allCards = [...handCards, ...dealPublicCards]
    const totalPot = selfInfo.totalPot
    const callScore = selfInfo.callScore
    const overPot = callScore > totalPot / 2 - 1
    switch (round) {
      case 'FLOP':
        //  翻牌
        switch (cardType) {
          case CardTypeEnum.HIGH_CARD:
            if (!this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !overPot) {
              if (this.checkMeBuyFlush(allCards) || (this.checkMeBuyStraight(allCards) && !this.checkBuyFlush(dealPublicCards) && !this.checkStraight(dealPublicCards))) {
                cardFaceGood = true
              }
            }
            break
          case CardTypeEnum.ONE_PAIRS:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !this.checkHats(dealPublicCards, handCards) && !overPot) {
              // 检查是否是公对、花面、顺面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.TWO_PAIRS:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !overPot) {
              // 检查是否是公对、花面、顺面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.THREE_OF_A_KIND:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards)) {
              // 检查是否是公对、花面、顺面、有无帽子
              cardFaceGood = true
            }
            break
          case CardTypeEnum.STRAIGHT:
            if (!this.checkFlush(dealPublicCards)) {
              // 检查是否是花面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.FLUSH:
            cardFaceGood = true
            break
          case CardTypeEnum.FULLHOUSE:
            cardFaceGood = true
            break
          case CardTypeEnum.FOUR_OF_A_KIND:
            cardFaceGood = true
            break
          case CardTypeEnum.STRAIGHT_FLUSH:
            cardFaceGood = true
            break
          case CardTypeEnum.ROYAL_FLUSH:
            cardFaceGood = true
            break
          default:
            break
        }
        break;
      case 'TURN':
        //  转牌
        switch (cardType) {
          case CardTypeEnum.HIGH_CARD:
            if (!this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !overPot) {
              if (this.checkMeBuyFlush(allCards) && this.checkMeBuyStraight(allCards)) {
                cardFaceGood = true
              }
            }
            break
          case CardTypeEnum.ONE_PAIRS:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !overPot) {
              // 检查是否是公对、花面、顺面、有无帽子
              if (this.checkMeBuyFlush(allCards) || (this.checkMeBuyStraight(allCards) && !this.checkBuyFlush(dealPublicCards))) {
                // 检查是否买顺买花
                cardFaceGood = true
              }
            }
            break
          case CardTypeEnum.TWO_PAIRS:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !this.checkHats(dealPublicCards, handCards) && !overPot) {
              // 检查是否是公对、花面、顺面、有无帽子
              cardFaceGood = true
            }

            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !overPot) {
              // 检查是否是公对、花面、顺面、有无帽子
              if (this.checkMeBuyFlush(allCards) || (this.checkMeBuyStraight(allCards) && !this.checkBuyFlush(dealPublicCards))) {
                // 检查是否买顺买花
                cardFaceGood = true
              } else if (!this.checkStraight(dealPublicCards)) {
                cardFaceGood = true
              }
            }
            break
          case CardTypeEnum.THREE_OF_A_KIND:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !this.checkHats(dealPublicCards, handCards)) {
              // 检查是否是公对、花面、顺面、有无帽子
              cardFaceGood = true
            }
            break
          case CardTypeEnum.STRAIGHT:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards)) {
              // 检查是否是公对、花面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.FLUSH:
            if (!this.checkCommonPairs(dealPublicCards)) {
              // 检查是否是公对、花面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.FULLHOUSE:
            cardFaceGood = true
            break
          case CardTypeEnum.FOUR_OF_A_KIND:
            cardFaceGood = true
            break
          case CardTypeEnum.STRAIGHT_FLUSH:
            cardFaceGood = true
            break
          case CardTypeEnum.ROYAL_FLUSH:
            cardFaceGood = true
            break
          default:
            break
        }
        break;
      case 'RIVER':
        //  河牌
        switch (cardType) {
          case CardTypeEnum.HIGH_CARD:
            break
          case CardTypeEnum.ONE_PAIRS:
            break
          case CardTypeEnum.TWO_PAIRS:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !this.checkHats(dealPublicCards, handCards) && !overPot) {
              // 检查是否是公对、花面、顺面、有无帽子
              cardFaceGood = true
            }
            break
          case CardTypeEnum.THREE_OF_A_KIND:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards) && !this.checkStraight(dealPublicCards) && !this.checkHats(dealPublicCards, handCards)) {
              // 检查是否是公对、花面、顺面、有无帽子
              cardFaceGood = true
            }
            break
          case CardTypeEnum.STRAIGHT:
            if (!this.checkCommonPairs(dealPublicCards) && !this.checkFlush(dealPublicCards)) {
              // 检查是否是公对、花面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.FLUSH:
            if (!this.checkCommonPairs(dealPublicCards)) {
              // 检查是否是公对、花面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.FULLHOUSE:
            if (!this.checkFlush(dealPublicCards)) {
              // 检查是否是公对、花面
              cardFaceGood = true
            }
            break
          case CardTypeEnum.FOUR_OF_A_KIND:
            cardFaceGood = true
            break
          case CardTypeEnum.STRAIGHT_FLUSH:
            cardFaceGood = true
            break
          case CardTypeEnum.ROYAL_FLUSH:
            cardFaceGood = true
            break
          default:
            break
        }
        break;
      default:
        //  翻前
        const leftCard = handCards[0]
        const rightCard = handCards[1]
        const leftCardWithDeleteColor = this.deleteColor(leftCard) === '01' ? 14 : parseInt(this.deleteColor(leftCard), 10)
        const rightCardWithDeleteColor = this.deleteColor(rightCard) === '01' ? 14 : parseInt(this.deleteColor(rightCard), 10)
        const leftCardColor = this.getColor(leftCard)
        const rightCardColor = this.getColor(rightCard)
        if (overPot) {
          if (leftCardWithDeleteColor > 12 && rightCardWithDeleteColor > 12) {
            cardFaceGood = true
          } else if (leftCardWithDeleteColor === rightCardWithDeleteColor && rightCardWithDeleteColor === 12) {
            cardFaceGood = true
          }
        } else if (leftCardWithDeleteColor > 9 && rightCardWithDeleteColor > 9) {
          cardFaceGood = true
        } else if (leftCardWithDeleteColor === rightCardWithDeleteColor) {
          cardFaceGood = true
        } else if (leftCardColor === rightCardColor) {
          if ([leftCardWithDeleteColor, rightCardWithDeleteColor].includes(14)) {
            cardFaceGood = true
          } else if (leftCardWithDeleteColor > 8 && rightCardWithDeleteColor > 8) {
            cardFaceGood = true
          } else if (Math.abs(leftCardWithDeleteColor - rightCardWithDeleteColor) === 1 && leftCardWithDeleteColor > 4 && rightCardWithDeleteColor > 4) {
            cardFaceGood = true
          } else if (Math.abs(leftCardWithDeleteColor - rightCardWithDeleteColor) === 2 && leftCardWithDeleteColor + rightCardWithDeleteColor === 18) {
            cardFaceGood = true
          }
        } else if ([leftCardWithDeleteColor, rightCardWithDeleteColor].includes(14) && leftCardWithDeleteColor > 4 && rightCardWithDeleteColor > 4) {
          cardFaceGood = true
        }
        break;
    }
    return cardFaceGood
  }

  checkMeBuyFlush(cards) {
    const flush1 = []
    const flush2 = []
    const flush3 = []
    const flush4 = []
    cards.forEach(item => {
      const color = this.getColor(item)
      switch (color) {
        case '1':
          flush1.push(color)
          break
        case '2':
          flush2.push(color)
          break
        case '3':
          flush3.push(color)
          break
        case '4':
          flush4.push(color)
          break
        default:
          break
      }
    })
    return (flush1.length > 3 || flush2.length > 3 || flush3.length > 3 || flush4.length > 3)
  }

  checkMeBuyStraight(cards) {
    let meBuyStraight = false
    let cardsWithDeleteColor = []
    cards.forEach(item => {
      cardsWithDeleteColor.push(parseInt(this.deleteColor(item), 10))
    })
    cardsWithDeleteColor.sort((a, b) => a - b)
    cardsWithDeleteColor = cardsWithDeleteColor.filter(item => item !== 1)
    for (let i = 0; i < cardsWithDeleteColor.length - 3; i++) {
      if ((cardsWithDeleteColor[i] + 1 === cardsWithDeleteColor[i + 1]) && (cardsWithDeleteColor[i] + 2 === cardsWithDeleteColor[i + 2]) && (cardsWithDeleteColor[i] + 3 === cardsWithDeleteColor[i + 3])) {
        meBuyStraight = true
      }
    }

    return meBuyStraight
  }

  /**
   * 检查是否有帽子
   * @param dealPublicCards
   * @param myCards
   */
  checkHats(dealPublicCards, myCards) {
    const publicCardsWithDeleteColor = []
    dealPublicCards.forEach(item => {
      publicCardsWithDeleteColor.push(parseInt(this.deleteColor(item), 10))
    })
    publicCardsWithDeleteColor.sort((a, b) => b - a)
    const maxPublicCard = publicCardsWithDeleteColor[0]

    return ![parseInt(this.deleteColor(myCards[0]), 10), parseInt(this.deleteColor(myCards[1]), 10)].includes(maxPublicCard)
  }

  /**
   * 检查是否有公对
   * @param dealPublicCards
   */
  checkCommonPairs(dealPublicCards) {
    let commonPairs = false
    const publicCards = []
    dealPublicCards.forEach(item => {
      const publicCardWithDeleteColor = this.deleteColor(item)
      if (publicCards.includes(publicCardWithDeleteColor)) {
        commonPairs = true
      } else {
        publicCards.push(publicCardWithDeleteColor)
      }
    })
    return commonPairs
  }

  /**
   * 检查是否买花面
   * @param dealPublicCards
   */
  checkBuyFlush(dealPublicCards) {
    let buyFlush = false
    const publicFlush = []
    dealPublicCards.forEach(item => {
      const color = this.getColor(item)
      if (publicFlush.includes(color)) {
        buyFlush = true
      } else {
        publicFlush.push(color)
      }
    })
    return buyFlush
  }

  /**
   * 检查是否花面
   * @param dealPublicCards
   */
  checkFlush(dealPublicCards) {
    const flush1 = []
    const flush2 = []
    const flush3 = []
    const flush4 = []
    dealPublicCards.forEach(item => {
      const color = this.getColor(item)
      switch (color) {
        case '1':
          flush1.push(color)
          break
        case '2':
          flush2.push(color)
          break
        case '3':
          flush3.push(color)
          break
        case '4':
          flush4.push(color)
          break
        default:
          break
      }
    })
    return (flush1.length > 2 || flush2.length > 2 || flush3.length > 2 || flush4.length > 2)
  }

  /**
   * 检查是否买顺面
   * @param dealPublicCards
   */
  checkBuyStraight(dealPublicCards) {
    let buyStraight = false
    let publicCardsWithDeleteColor = []
    dealPublicCards.forEach(item => {
      publicCardsWithDeleteColor.push(parseInt(this.deleteColor(item), 10))
    })

    publicCardsWithDeleteColor.sort((a, b) => a - b)

    const ATemp = []
    publicCardsWithDeleteColor.forEach(item => {
      if (item === 1) {
        ATemp.push(14)
      }
    })
    publicCardsWithDeleteColor = [...publicCardsWithDeleteColor, ...ATemp]

    for (let i = 0; i < publicCardsWithDeleteColor.length - 1; i++) {
      for (let j = 1; j < publicCardsWithDeleteColor.length; j++) {
        const diff = Math.abs(publicCardsWithDeleteColor[i] - publicCardsWithDeleteColor[j])
        if (diff < 3 && diff > 0) {
          buyStraight = true
        }
      }
    }

    return buyStraight
  }

  /**
   * 检查是否顺面
   * @param dealPublicCards
   */
  checkStraight(dealPublicCards) {
    let straight = false
    let publicCardsWithDeleteColor = []
    dealPublicCards.forEach(item => {
      publicCardsWithDeleteColor.push(parseInt(this.deleteColor(item), 10))
    })
    publicCardsWithDeleteColor.sort((a, b) => a - b)

    const ATemp = []
    publicCardsWithDeleteColor.forEach(item => {
      if (item === 1) {
        ATemp.push(14)
      }
    })
    publicCardsWithDeleteColor = [...publicCardsWithDeleteColor, ...ATemp]

    for (let i = 0; i < publicCardsWithDeleteColor.length - 2; i++) {
      if ((publicCardsWithDeleteColor[i] + 1 === publicCardsWithDeleteColor[i + 1]) && (publicCardsWithDeleteColor[i] + 2 === publicCardsWithDeleteColor[i + 2])) {
        straight = true
      } else if ((publicCardsWithDeleteColor[i] + 2 === publicCardsWithDeleteColor[i + 1]) && (publicCardsWithDeleteColor[i] + 3 === publicCardsWithDeleteColor[i + 2])) {
        straight = true
      } else if ((publicCardsWithDeleteColor[i] + 3 === publicCardsWithDeleteColor[i + 1]) && (publicCardsWithDeleteColor[i] + 4 === publicCardsWithDeleteColor[i + 2])) {
        straight = true
      } else if ((publicCardsWithDeleteColor[i] + 1 === publicCardsWithDeleteColor[i + 1]) && (publicCardsWithDeleteColor[i] + 3 === publicCardsWithDeleteColor[i + 2])) {
        straight = true
      } else if ((publicCardsWithDeleteColor[i] + 1 === publicCardsWithDeleteColor[i + 1]) && (publicCardsWithDeleteColor[i] + 4 === publicCardsWithDeleteColor[i + 2])) {
        straight = true
      } else if ((publicCardsWithDeleteColor[i] + 2 === publicCardsWithDeleteColor[i + 1]) && (publicCardsWithDeleteColor[i] + 4 === publicCardsWithDeleteColor[i + 2])) {
        straight = true
      }
    }

    return straight
  }

  /**
   * 判断当前位置是否有利
   * @param sitUserList
   * @param userId
   */
  isPosGood(sitUserList, userId) {
    const len = sitUserList.length
    let currentIndex = 0
    for (let i = 0; i < len; i++) {
      if (sitUserList[i].userId === userId) {
        currentIndex = i
        break
      }
    }
    const flat = Math.round(len / 3) * 2;
    return (currentIndex + 1) > flat
  }

  /**
   * 去掉花色
   * @param card
   */
  deleteColor(card) {
    let cardWithDeleteColor = card.toString()
    cardWithDeleteColor = cardWithDeleteColor.substr(1)
    return cardWithDeleteColor.toString()
  }

  /**
   * 获取花色
   * @param card
   */
  getColor(card) {
    let cardWithGetColor = card.toString()
    cardWithGetColor = cardWithGetColor[0]
    return cardWithGetColor.toString()
  }
}
