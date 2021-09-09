/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: string;
}

export interface IGetUserResponse {
  success: boolean;
  message: string;
  data: IUserOptions;
}

export interface ISelfInfo {
  callScore: number;
  canActionList: Array<string>;
  handCards: Array<number>;
  isCanRaise: number;
  lastBet: number;
  maxRaiseScore: number;
  minRaiseScore: number;
  seatScore: number;
  userId: number;
  round: string;
  totalPot: number;
  cardType: string,
  sitUserList: Array<object>
  dealPublicCards: Array<number>
}

export interface INextOP {
  type: string;
  value: number;
}
