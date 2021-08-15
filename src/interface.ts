/*
 * @Author: caopx
 * @Date: 2021-04-02 18:05:41
 * @LastEditTime: 2021-04-08 10:09:50
 */
/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

export interface IAvatarOptions {
  avatarUrl: string;
}

export interface IClientConfig {
  credential: ICredential,
  region: string,
  profile: IHttpProfile
}

export interface ICredential {
  secretId: string,
  secretKey: string,
}

export interface ICosCredential {
  SecretId: string,
  SecretKey: string,
}

interface IHttpProfile {
  httpProfile: IEndpoint
}

interface IEndpoint {
  endpoint: string
}
// 上传buffer
export interface IImgData {
  fileName: string,
  fileBuffer?: Buffer
}

export interface IGetAvatar {
  /** 返回对象 Url */
  imgUrl: string,
  imgName: string
}
