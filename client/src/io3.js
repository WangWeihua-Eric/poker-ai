const debounce = (fn, wait = 100, immediate = true) => {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      const callNow = !timeout;
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
      if (callNow) fn.apply(context, args);
    } else {
      timeout = setTimeout(() => {
        fn.apply(context, args);
      }, wait);
    }
  };
};

function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(
        ((Math.random() * new Date().getTime()) % minNum) + 1,
        10
      );
      break;
    case 2:
      return parseInt(
        ((Math.random() * new Date().getTime()) % (maxNum - minNum)) +
          minNum +
          1,
        10
      );
      break;
    default:
      return Math.random();
      break;
  }
}

let realOPTimeHandler = null;

const realOP = payLoad => {
  if (realOPTimeHandler) {
    clearTimeout(realOPTimeHandler);
    realOPTimeHandler = null;
  }
  const type = payLoad.type;
  let time = randomNum(2500, 6000);
  switch (type) {
    case 'CHECK':
    case 'FOLD':
    case 'CALL':
      time = randomNum(1000, 4000);
      break;
    case 'RAISE':
      time = randomNum(3000, 7000);
      break;
    case 'ALL_IN':
      time = randomNum(4000, 10000);
      break;
    default:
      break;
  }
  realOPTimeHandler = setTimeout(() => {
    switch (type) {
      case 'CALL':
        WePokerWebSocketClient.call();
        break;
      case 'CHECK':
        WePokerWebSocketClient.checkCards();
        break;
      case 'FOLD':
        WePokerWebSocketClient.fold();
        break;
      case 'RAISE':
        WePokerWebSocketClient.raise(payLoad.value);
        break;
      case 'ALL_IN':
        WePokerWebSocketClient.allin();
        break;
      default:
        break;
    }
    realOPTimeHandler = null;
  }, time);
};

const getNextOperating = decodeRes => {
  fetch('https://node.fengjinketang.com/wpkpro/test', {
    method: 'POST',
    body: JSON.stringify(decodeRes),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      return response.json();
    })
    .then(res => {
      console.log('wpkPro ??????????????????????????????', res);
      if (res && res.state && res.state.code === '0') {
        realOP(res.data);
      }
    })
    .catch(e => {
      console.error('wpkPro ?????????????????????????????????????????????????????????', e);
    });
};

let round = 'PRE_FOLP';
let totalPot = 0;
let cardType = 'HIGH_CARD';
let sitUserList = [];
let dealPublicCards = [];
let actionList = [];

const formatSitUserList = () => {
  sitUserList.sort((a, b) => {
    return a.seatNum - b.seatNum;
  });
  const sitUserListPreTmp = [];
  const sitUserListNextTmp = [];

  sitUserList.forEach(item => {
    if (item.seatPos === 'SMALL_BLIND' || sitUserListNextTmp.length) {
      sitUserListNextTmp.push(item);
    } else {
      sitUserListPreTmp.push(item);
    }
  });

  return [...sitUserListNextTmp, ...sitUserListPreTmp].filter(
    item => item.state !== 'FOLD'
  );
};

const preGetNextOP = debounce(msgBody => {
  //  ???????????????
  console.log('wpkPro ????????????????????????');
  const req = {
    callScore: msgBody.callScore, //  ????????????????????????
    // canActionList: msgBody.canActionList, //  ?????????????????????
    // handCards: msgBody.handCards, //  ????????????
    // isCanRaise: msgBody.isCanRaise, //  ???????????? re
    // lastBet: msgBody.lastBet, //  ??????????????????????????????
    // maxRaiseScore: msgBody.maxRaiseScore, //  ???????????? re ??????
    // minRaiseScore: msgBody.minRaiseScore, //  ???????????? re ??????
    // seatScore: msgBody.seatScore,
    // userId: msgBody.userId, //  ?????? id
    round, //  ???????????????
    // totalPot, //  ??????
    // cardType, //  ????????????
    // sitUserList: formatSitUserList(), //  ??????
    // dealPublicCards, //  ??????
    // actionList, //  ??????
  };

  console.log('wpkPro ???????????????????????????', req);
  getNextOperating(req);
});

const formatReq = data => {
  if (data) {
    const protoType = data.protoType;
    switch (protoType) {
      case 'BattleRoundChangeMsg':
        //  ?????????????????????
        {
          const msgBody = data.msgBody;
          if (msgBody) {
            if (msgBody.round) {
              round = msgBody.round;
              actionList.push({ actionType: round });
            }

            if (msgBody.cardType) {
              cardType = msgBody.cardType;
            }

            const dealPublicCardsTmp = msgBody.dealPublicCards;
            if (dealPublicCardsTmp && dealPublicCardsTmp.length === 1) {
              dealPublicCards.push(dealPublicCardsTmp[0]);
            } else if (dealPublicCardsTmp && dealPublicCardsTmp.length === 3) {
              dealPublicCards = dealPublicCardsTmp;
            } else {
              dealPublicCards = [];
            }

            if (
              msgBody.userAciton &&
              msgBody.userAciton.handCards &&
              msgBody.userAciton.handCards.length
            ) {
              preGetNextOP(msgBody.userAciton);
            }
          }
        }
        break;
      case 'BattleUserOptMsg':
        {
          const msgBody = data.msgBody;
          if (msgBody && msgBody.handCards && msgBody.handCards.length) {
            preGetNextOP(msgBody);
          }
        }
        break;
      case 'BattleActionMsg':
        {
          const msgBody = data.msgBody;
          if (msgBody) {
            if (msgBody.totalPot > -1) {
              totalPot = msgBody.totalPot;
            }

            if (msgBody.actionList && msgBody.actionList.length > 1) {
              actionList = msgBody.actionList;
            } else if (msgBody.actionList && msgBody.actionList.length) {
              actionList = [...actionList, ...msgBody.actionList];
            }

            if (
              msgBody.actionList &&
              msgBody.actionList.length &&
              msgBody.actionList.length === 2 &&
              sitUserList.length
            ) {
              if (msgBody.actionList.length === 2) {
                msgBody.actionList.forEach(item => {
                  for (let i = 0; i < sitUserList.length; i++) {
                    if (sitUserList[i].userId === item.userId) {
                      sitUserList[i].seatPos = item.actionType;
                      break;
                    }
                  }
                });
              } else if (msgBody.actionList.length) {
                msgBody.actionList.forEach(item => {
                  if (item.actionType === 'FOLD') {
                    for (let i = 0; i < sitUserList.length; i++) {
                      if (sitUserList[i].userId === item.userId) {
                        sitUserList[i].state = item.actionType;
                        break;
                      }
                    }
                  }
                });
              }
            }
          }
        }
        break;
      case 'BattleRoomMsg':
        {
          const msgBody = data.msgBody;
          if (msgBody && msgBody.sitUserList && msgBody.sitUserList.length) {
            const sitUserListTmp = [];
            msgBody.sitUserList.forEach(item => {
              const siteUser = {
                seatNum: item.seatNum,
                userId: item.userId,
                seatPos: '',
                state: '',
              };
              sitUserListTmp.push(siteUser);
            });
            sitUserList = sitUserListTmp;
          }
        }
        break;
      case 'BattleRoomDetailResp':
        break;
      case 'BattleUserProfileResp':
        break;
      case 'BattleBankChangeMsg':
        break;
      case 'WaitHandResp':
        break;
      case 'BattleDealCardPOList':
        break;
      case 'BattleThanResp':
        break;
      case 'RoomPlayRecordOneHand':
        break;
    }
  }
};

const OverloadHMFUtils = () => {
  HMFUtils.decodeProtoMsg = function (msg, callBack) {
    if ('string' === typeof msg) {
      const parseRes = JSON.parse(msg);
      callBack && callBack(parseRes);
    } else {
      const msgTmp = new Uint8Array(msg);
      const decodeRes = HMFUtils.decodeFun(msgTmp);
      // console.log('1111111111: ', decodeRes);
      formatReq(decodeRes);
      callBack && callBack(decodeRes);
    }
  };
};

const run = () => {
  fetch('https://node.fengjinketang.com/api/test')
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log('wpkPro ???????????????', data);
      OverloadHMFUtils();
    })
    .catch(e => {
      console.error(
        'wpkPro ?????????????????????????????????????????????????????????????????????????????????????????????????????????',
        e
      );
    });
};

run();
