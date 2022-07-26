import { ISignerEntry } from "./db";

export interface IMultiTransfer {
  node: string;
  // 非tp环境secret
  secret?: string;
  from: string;
  to: string;
  memo: string;
}

export interface IMultiSign {
  tx: any;

  secret?: string;
}

export interface IAccountSet {
  node: string;
  // 非tp环境secret
  secret?: string;
  account: string;

  // true 禁用密钥
  // false 恢复密钥
  disabled: boolean;
}

export interface ISignerList {
  node: string;
  // 非tp环境secret
  secret?: string;

  account: string;
  quorum: number;
  signers: ISignerEntry[];
}
