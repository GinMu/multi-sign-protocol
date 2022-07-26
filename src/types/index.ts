import { IAmount } from "@jccdex/common";
import { ISignerEntry } from "./db";

export interface IMultiSignOptions {
  token: IAmount;
}

/**
 * 转账topic
 *
 * @export
 * @interface IPaymentTopic
 */
export interface IPaymentTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      memo: string;
      account: string;
      to: string;
      seq: number;
      token: IAmount;
    };
  };
}

/**
 * 挂单topic
 *
 * @export
 * @interface ICreateOrderTopic
 */
export interface ICreateOrderTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      memo: string;
      account: string;
      seq: number;
      taker_pays: IAmount;
      taker_gets: IAmount;
    };
  };
}

/**
 * 撤单topic
 *
 * @export
 * @interface ICancelOrderTopic
 */
export interface ICancelOrderTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      orderSeq: number;
      seq: number;
    };
  };
}

/**
 * 设置资产上限topic
 *
 * @export
 * @interface ISetLimitTopic
 */
export interface ISetLimitTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      limit: IAmount;
      memo: string;
      seq: number;
    };
  };
}

/**
 * 冻结账号topic
 *
 * @export
 * @interface ISetBlackListTopic
 */
export interface ISetBlackListTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      blockAccount: string;
      memo: string;
      seq: number;
    };
  };
}

/**
 * 解冻账号topic
 *
 * @export
 * @interface IRemoveBlackListTopic
 */
export interface IRemoveBlackListTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      blockAccount: string;
      memo: string;
      seq: number;
    };
  };
}

/**
 * 通证发行topic
 *
 * @export
 * @interface IIssueSetTopic
 */
export interface IIssueSetTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      amount: IAmount;
      memo: string;
      seq: number;
    };
  };
}

/**
 * NFT发行topic
 *
 * @export
 * @interface ISetTokenIssueTopic
 */
export interface ISetTokenIssueTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      publisher: string;
      token: string;
      number: number;
      memo: string;
      seq: number;
    };
  };
}

/**
 * Token的信息
 *
 * @export
 * @interface ITokenInfo
 */
export interface ITokenInfo {
  type: string;
  data: string;
}

/**
 * 铸造NFTtopic
 *
 * @export
 * @interface IPublish721Topic
 */
export interface IPublish721Topic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      receiver: string;
      token: string;
      tokenId: string;
      infos: ITokenInfo[];
      seq: number;
    };
  };
}

/**
 * NFT转账topic
 *
 * @export
 * @interface ITransfer721Topic
 */
export interface ITransfer721Topic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      receiver: string;
      tokenId: string;
      memo: string;
      seq: number;
    };
  };
}

/**
 * 销毁NFTtopic
 *
 * @export
 * @interface IDelete721Topic
 */
export interface IDelete721Topic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      tokenId: string;
      memo: string;
      seq: number;
    };
  };
}

/**
 * 恢复密钥topic
 *
 * @export
 * @interface IEnableTopic
 */
export interface IEnableTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      seq: number;
      options: {
        clear_flag: number;
      };
    };
  };
}

export interface IAccountWeight {
  account: string;
  weight: number;
}

/**
 * 多签成员topic
 *
 * @export
 * @interface ISignerSetTopic
 */
export interface ISignerSetTopic {
  type: string;
  template: string;
  chainId: string;
  topic: {
    name: string;
    description: string;
    deadline: number;
    operation: {
      chainId: string;
      account: string;
      seq: number;
      threshold: number;
      lists: IAccountWeight[];
    };
  };
}

export interface IVote {
  type: string;
  action: string;
  topicMd5: string;
  chainId: string;
  account: string;
  deadline: number;
  multiSign: IBaseMultisignTx;
}

export interface IPayload {
  type: string;
  id: string;
  total: number;
  number: number;
  payload: string;
}

export interface ISubmitMultiSigned {
  node: string;
  tx;
}

export interface ISigner {
  Signer: {
    Account: string;
    SigningPubKey: string;
    TxnSignature: string;
  };
}

export interface IBaseMultisignTx {
  Flags: number;
  Fee: number | string;
  TransactionType: string;
  Sequence: number;
  SigningPubKey: string;
  Account: string;
  Signers: ISigner[];
}

export interface IAccountObjects {
  signers: ISignerEntry[];
  quorum: number;
}
