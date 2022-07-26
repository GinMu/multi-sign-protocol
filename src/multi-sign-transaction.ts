import { ActionType, CHAIN_ID, MEMO_TYPE } from "./constant/type";
import {
  IAccountObjects,
  IBaseMultisignTx,
  IEnableTopic,
  IMultiSignOptions,
  IPayload,
  IPaymentTopic,
  ICreateOrderTopic,
  ICancelOrderTopic,
  ISetLimitTopic,
  ISetBlackListTopic,
  IRemoveBlackListTopic,
  IIssueSetTopic,
  ISetTokenIssueTopic,
  IPublish721Topic,
  ITransfer721Topic,
  IDelete721Topic,
  ISignerSetTopic,
  ISubmitMultiSigned,
  IVote
} from "./types";
import BigNumber from "bignumber.js";
import { service } from "./fetch/service";
import {
  DELETE_721_TEMPLATE,
  TRANSFER_721_TEMPLATE,
  PUBLISH_721_TEMPLATE,
  SET_TOKEN_ISSUE_TEMPLATE,
  ISSUE_SET_TEMPLATE,
  REMOVE_BLACK_LIST_TEMPLATE,
  SET_BLACK_LIST_TEMPLATE,
  SET_LIMIT_TEMPLATE,
  CANCEL_ORDER_TEMPLATE,
  CREATE_ORDER_TEMPLATE,
  ENABLE_TEMPLATE,
  PAYMENT_TEMPLATE,
  SIGNER_SET_TEMPLATE
} from "./constant/template";
import { IAccountSet, IMultiSign, IMultiTransfer, ISignerList } from "./types/tp-transfer";
import { transfer } from "@jccdex/common";
import multiSign from "./util/sign-helper";
import { isHex64Str } from "./util";
import setAccount from "./util/set-account-helper";
import setSignerList from "./util/signer-list-helper";
import {
  Amount,
  wallet,
  invariant,
  Transaction,
  isDef,
  isPositiveInteger,
  isPositiveStr,
  string2json,
  isJSON,
  IAmount,
  secondsSinceEpoch
} from "@jccdex/common";
const md5 = require("spark-md5");

export default class MultiSignTransaction {
  private token: IAmount;
  private chainId = CHAIN_ID.SWTC;

  constructor(options: IMultiSignOptions) {
    const { token } = options;
    this.token = token;
  }

  public static secondsSinceEpoch(): number {
    return secondsSinceEpoch();
  }

  public static md5(msg: string): string {
    return md5.hash(msg);
  }

  /**
   * 获取多签账号列表及权重
   *
   * @static
   * @param {*} { node, account }
   * @returns {Promise<IAccountObjects>}
   * @memberof MultiSignTransaction
   */
  public static async fetchSignerList({ node, account }): Promise<IAccountObjects> {
    const res: any = await service({
      url: node,
      method: "post",
      data: {
        method: "account_objects",
        params: [
          {
            account,
            type: "SignerList"
          }
        ]
      }
    });
    const signerInfo = res?.result?.account_objects?.[0];

    if (!isDef(signerInfo)) {
      return null;
    }

    return {
      signers: signerInfo.SignerEntries.map((s) => {
        return {
          account: s.SignerEntry.Account,
          weight: s.SignerEntry.SignerWeight
        };
      }),
      quorum: signerInfo.SignerQuorum
    };
  }

  /**
   * 获取区块上所有交易
   *
   * @static
   * @param {*} {node, block}
   * @returns
   * @memberof MultiSignTransaction
   */
  public static async fetchBlockTransactions({ node, block }) {
    const res: any = await service({
      method: "get",
      url: node + "/block/trans/" + block,
      params: {
        b: block
      }
    });
    if (res.code === "0" && Array.isArray(res?.data?.list)) {
      const txs = res?.data?.list;
      return txs.map((tx) => {
        const { memos } = tx || {};
        const memo = Transaction.convertMemo(memos);
        const action = isJSON(memo) ? string2json(memo) : memo;
        return Object.assign({}, tx, { memo: action, time: Transaction.convertTime(tx.time) });
      });
    }
    return [];
  }

  /**
   * 获取账号信息
   *
   * @static
   * @param {*} { node, account }
   * @returns
   * @memberof MultiSignTransaction
   */
  public static async fetchAccountInfo({ node, account }) {
    const res: any = await service({
      data: {
        method: "account_info",
        params: [
          {
            account
          }
        ]
      },
      method: "post",
      url: node
    });
    const status = res?.result?.status;
    if (status !== "success") {
      throw new Error(res.result.error_message);
    }

    return res.result.account_data;
  }

  /**
   * 获取最新区块
   *
   * @static
   * @param {string} node
   * @returns {Promise<number>}
   * @memberof MultiSignTransaction
   */
  public static async fetchLatestBlock(node: string): Promise<number> {
    const res: any = await service({
      url: node,
      method: "post",
      data: {
        method: "ledger_closed"
      }
    });
    return res?.result?.ledger_index;
  }

  /**
   * 序列化转账topic
   *
   * @param {*} { name, description, deadline, from, to, seq, token }
   * @returns {IPaymentTopic}
   * @memberof MultiSignTransaction
   */
  public serializePaymentTopic({ name, description, deadline, from, to, seq, token, memo }): IPaymentTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: PAYMENT_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          memo: memo || "",
          account: from,
          to,
          seq,
          token
        }
      }
    };
    invariant(this.isPaymentTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化挂单topic
   *
   * @param {*} { name, description, deadline, account, taker_pays, taker_gets, memo, seq }
   * @returns {ICreateOrderTopic}
   * @memberof MultiSignTransaction
   */
  public serializeCreateOrderTopic({
    name,
    description,
    deadline,
    account,
    taker_pays,
    taker_gets,
    memo,
    seq
  }): ICreateOrderTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: CREATE_ORDER_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          memo: memo || "",
          account,
          seq,
          taker_gets,
          taker_pays
        }
      }
    };
    invariant(this.isCreateOrderTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化撤单topic
   *
   * @param {*} { name, description, deadline, account, orderSeq, seq }
   * @returns {ICancelOrderTopic}
   * @memberof MultiSignTransaction
   */
  public serializeCancelOrderTopic({ name, description, deadline, account, orderSeq, seq }): ICancelOrderTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: CANCEL_ORDER_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          orderSeq,
          seq
        }
      }
    };
    invariant(this.isCancelOrderTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化设置资产上限topic
   *
   * @param {*} { name, description, deadline, account, limit, memo, seq }
   * @returns {ISetLimitTopic}
   * @memberof MultiSignTransaction
   */
  public serializeSetLimitTopic({ name, description, deadline, account, limit, memo, seq }): ISetLimitTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: SET_LIMIT_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          limit,
          memo: memo || "",
          seq
        }
      }
    };
    invariant(this.isSetLimitTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化冻结账号topic
   *
   * @param {*} { name, description, deadline, account, blockAccount, memo, seq }
   * @returns {ISetBlackListTopic}
   * @memberof MultiSignTransaction
   */
  public serializeSetBlackListTopic({
    name,
    description,
    deadline,
    account,
    blockAccount,
    memo,
    seq
  }): ISetBlackListTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: SET_BLACK_LIST_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          blockAccount,
          memo,
          seq
        }
      }
    };
    invariant(this.isSetBlackListTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化解冻账号topic
   *
   * @param {*} { name, description, deadline, account, blockAccount, memo, seq }
   * @returns {IRemoveBlackListTopic}
   * @memberof MultiSignTransaction
   */
  public serializeRemoveBlackListTopic({
    name,
    description,
    deadline,
    account,
    blockAccount,
    memo,
    seq
  }): IRemoveBlackListTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: REMOVE_BLACK_LIST_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          blockAccount,
          memo,
          seq
        }
      }
    };
    invariant(this.isRemoveBlackListTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化通证发行topic
   *
   * @param {*} { name, description, deadline, account, amount, memo, seq }
   * @returns {IIssueSetTopic}
   * @memberof MultiSignTransaction
   */
  public serializeIssueSetTopic({ name, description, deadline, account, amount, memo, seq }): IIssueSetTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: ISSUE_SET_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          amount,
          memo,
          seq
        }
      }
    };
    invariant(this.isIssueSetTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化NFT发行topic
   *
   * @param {*} { name, description, deadline, account, publisher, token, number, memo, seq }
   * @returns {ISetTokenIssueTopic}
   * @memberof MultiSignTransaction
   */
  public serializeSetTokenIssueTopic({
    name,
    description,
    deadline,
    account,
    publisher,
    token,
    number,
    memo,
    seq
  }): ISetTokenIssueTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: SET_TOKEN_ISSUE_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          publisher,
          token,
          number,
          memo,
          seq
        }
      }
    };
    invariant(this.isSetTokenIssueTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化铸造NFTtopic
   *
   * @param {*} { name, description, deadline, account, receiver, token, tokenId, infos, seq }
   * @returns {IPublish721Topic}
   * @memberof MultiSignTransaction
   */
  public serializePublish721Topic({
    name,
    description,
    deadline,
    account,
    receiver,
    token,
    tokenId,
    infos,
    seq
  }): IPublish721Topic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: PUBLISH_721_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          receiver,
          token,
          tokenId,
          infos: isDef(infos) ? infos : [],
          seq
        }
      }
    };
    invariant(this.isPublish721Topic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化NFT转账topic
   *
   * @param {*} { name, description, deadline, account, receiver, tokenId, memo, seq }
   * @returns {ITransfer721Topic}
   * @memberof MultiSignTransaction
   */
  public serializeTransfer721Topic({
    name,
    description,
    deadline,
    account,
    receiver,
    tokenId,
    memo,
    seq
  }): ITransfer721Topic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: TRANSFER_721_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          receiver,
          tokenId,
          memo,
          seq
        }
      }
    };
    invariant(this.isTransfer721Topic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化销毁NFTtopic
   *
   * @param {*} { name, description, deadline, account, tokenId, memo, seq }
   * @returns {IDelete721Topic}
   * @memberof MultiSignTransaction
   */
  public serializeDelete721Topic({ name, description, deadline, account, tokenId, memo, seq }): IDelete721Topic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: DELETE_721_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          tokenId,
          memo,
          seq
        }
      }
    };
    invariant(this.isDelete721Topic(data), "The topic includes invalid value");
    return data;
  }

  /** 序列化恢复密钥topic
   *
   *
   * @param {*} { name, description, deadline, seq, account }
   * @returns {IEnableTopic}
   * @memberof MultiSignTransaction
   */
  public serializeEnableTopic({ name, description, deadline, seq, account }): IEnableTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: ENABLE_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          seq,
          options: {
            clear_flag: 4
          }
        }
      }
    };
    invariant(this.isEnableTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化多签成员管理topic
   *
   * @param {*} { name, description, deadline, seq, account, threshold, lists }
   * @returns {ISignerSetTopic}
   * @memberof MultiSignTransaction
   */
  public serializeSignerSetTopic({ name, description, deadline, seq, account, threshold, lists }): ISignerSetTopic {
    const data = {
      type: MEMO_TYPE.MULTI_SIGN,
      template: SIGNER_SET_TEMPLATE.name,
      chainId: this.chainId,
      topic: {
        name,
        description,
        deadline,
        operation: {
          chainId: this.chainId,
          account,
          seq,
          threshold,
          lists
        }
      }
    };
    invariant(this.isSignerSetTopic(data), "The topic includes invalid value");
    return data;
  }

  /**
   * 序列化投票
   *
   * @param {*} {
   *     account, 多签成员地址
   *
   *     deadline,
   *
   *     multiSign, multiSign接口返回结果
   *   }
   * @returns
   * @memberof MultiSignTransaction
   */
  public serializeVote({ account, deadline, multiSign, md5 }) {
    const data = {
      type: MEMO_TYPE.ORACLE,
      action: ActionType.MULTI_SIGN,
      chainId: this.chainId,
      account,
      topicMd5: md5,
      deadline,
      multiSign
    };
    invariant(this.isVote(data), "The vote includes invalid value");
    return data;
  }

  /**
   * 序列化注册
   *
   * @param {*} account
   * @returns
   * @memberof MultiSignTransaction
   */
  public serializeRegister(account) {
    const data = {
      type: MEMO_TYPE.NAME_SERVICE,
      action: ActionType.REGISTER,
      account,
      category: ActionType.MULTI_SIGN
    };
    invariant(this.isRegisterAction(data), "The register action includes invalid value");
    return data;
  }

  /**
   * 序列化注销
   *
   * @param {*} account
   * @returns
   * @memberof MultiSignTransaction
   */
  public serializeUnregister(account) {
    const data = {
      type: MEMO_TYPE.NAME_SERVICE,
      action: ActionType.UNREGISTER,
      account,
      category: ActionType.MULTI_SIGN
    };
    invariant(this.isUnregisterAction(data), "The unregister action includes invalid value");
    return data;
  }

  /**
   * 序列化payload
   *
   * @param {*} {total, number, payload}
   * @returns {IPayload}
   * @memberof MultiSignTransaction
   */
  public serializePayload({ total, number, payload, id }): IPayload {
    const data = {
      type: MEMO_TYPE.PAYLOAD,
      total,
      number,
      id,
      payload
    };
    invariant(this.isPayload(data), "The payload includes invalid value");
    return data;
  }

  /**
   * 是否是多签注册登记
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isRegisterAction(data): boolean {
    const { type, action, account, category } = data || {};
    return (
      type === MEMO_TYPE.NAME_SERVICE &&
      action === ActionType.REGISTER &&
      wallet.isValidAddress(account) &&
      category === ActionType.MULTI_SIGN
    );
  }

  /**
   * 是否是多签注销登记
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isUnregisterAction(data): boolean {
    const { type, action, account, category } = data || {};
    return (
      type === MEMO_TYPE.NAME_SERVICE &&
      action === ActionType.UNREGISTER &&
      wallet.isValidAddress(account) &&
      category === ActionType.MULTI_SIGN
    );
  }

  /**
   * 是否是转账topic
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isPaymentTopic(data: IPaymentTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, to, seq, token, memo } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      wallet.isValidAddress(to) &&
      Transaction.isSequence(seq) &&
      Amount.isValid(token) &&
      isDef(memo)
    );
  }

  /**
   * 是否是恢复密钥topic
   *
   * @param {IEnableTopic} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isEnableTopic(data: IEnableTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, seq, options } = operation || {};
    const { clear_flag } = options || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      Transaction.isSequence(seq) &&
      clear_flag === 4
    );
  }

  /**
   * 是否是多签成员管理topic
   *
   * @param {ISignerSetTopic} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isSignerSetTopic(data: ISignerSetTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, seq, threshold, lists } = operation || {};
    const isValid =
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      Transaction.isSequence(seq) &&
      isPositiveInteger(threshold) &&
      Array.isArray(lists) &&
      lists.every((l) => wallet.isValidAddress(l.account) && isPositiveInteger(l.weight));
    if (!isValid) {
      return isValid;
    }

    // 成员总票数
    const totalQuorum = lists.map((l) => l.weight).reduce((a, b) => a + b, 0);

    const signers = Array.from(new Set(lists.map((l) => l.account)));

    // 成员总票数不小于通过权重
    // 每个成员票数小于通过权重
    // 成员数不大于8
    // 不能有重复成员
    return (
      totalQuorum >= threshold &&
      lists.every((l) => l.weight < threshold) &&
      lists.length <= 8 &&
      signers.length === lists.length
    );
  }

  public isPayload(data: IPayload): boolean {
    const { type, total, number, payload, id } = data;
    return (
      type === MEMO_TYPE.PAYLOAD &&
      isPositiveInteger(total) &&
      isPositiveInteger(number) &&
      isPositiveStr(payload) &&
      isPositiveStr(id)
    );
  }

  /**
   * 多签成员对交易签名
   *
   * @param {IMultiSign} data
   * @returns
   * @memberof MultiSignTransaction
   */
  public async multiSign(data: IMultiSign) {
    return await multiSign(data);
  }

  /**
   * 提交多签名交易
   *
   * @param {ISubmitMultiSigned} data
   * @returns
   * @memberof MultiSignTransaction
   */
  public async submitMultiSigned(data: ISubmitMultiSigned) {
    const { node, tx } = data;

    const res = await service({
      url: node,
      method: "post",
      data: {
        method: "submit_multisigned",
        params: [
          {
            tx_json: tx
          }
        ]
      }
    });
    return res;
  }

  private isBaseMultisign(data: IBaseMultisignTx): boolean {
    const { Fee, TransactionType, Account, Sequence, SigningPubKey, Signers } = data || {};

    return (
      new BigNumber(Fee).isPositive() &&
      isPositiveStr(TransactionType) &&
      wallet.isValidAddress(Account) &&
      Number.isInteger(Sequence) &&
      Sequence >= 0 &&
      SigningPubKey === "" &&
      Array.isArray(Signers) &&
      Signers.length === 1 &&
      Signers.every(
        (s) =>
          wallet.isValidAddress(s?.Signer?.Account) &&
          isPositiveStr(s?.Signer?.SigningPubKey) &&
          isPositiveStr(s?.Signer?.TxnSignature)
      )
    );
  }

  /**
   * 是否是投票信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isVote(data: IVote): boolean {
    const { type, action, chainId, account, deadline, multiSign, topicMd5 } = data || {};
    return (
      type === MEMO_TYPE.ORACLE &&
      chainId === this.chainId &&
      action === ActionType.MULTI_SIGN &&
      wallet.isValidAddress(account) &&
      isPositiveInteger(deadline) &&
      this.isBaseMultisign(multiSign) &&
      isDef(topicMd5) &&
      account === multiSign.Signers[0].Signer.Account
    );
  }

  /**
   * 是否是挂单信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isCreateOrderTopic(data: ICreateOrderTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, memo, account, seq, taker_gets, taker_pays } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      isDef(memo) &&
      wallet.isValidAddress(account) &&
      Transaction.isSequence(seq) &&
      Amount.isValid(taker_gets) &&
      Amount.isValid(taker_pays)
    );
  }

  /**
   * 是否是撤单信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isCancelOrderTopic(data: ICancelOrderTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, orderSeq, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      Transaction.isSequence(orderSeq) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是设置资产上限信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isSetLimitTopic(data: ISetLimitTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, limit, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      Amount.isValid(limit) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是冻结账户信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isSetBlackListTopic(data: ISetBlackListTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, blockAccount, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      wallet.isValidAddress(blockAccount) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是解冻账户信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isRemoveBlackListTopic(data: IRemoveBlackListTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, blockAccount, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      wallet.isValidAddress(blockAccount) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是通证发行信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isIssueSetTopic(data: IIssueSetTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, amount, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      Amount.isValid(amount) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是NFT发行信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isSetTokenIssueTopic(data: ISetTokenIssueTopic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, publisher, token, number, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      wallet.isValidAddress(publisher) &&
      isPositiveStr(token) &&
      isPositiveInteger(number) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是铸造NFT信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isPublish721Topic(data: IPublish721Topic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, receiver, token, tokenId, infos, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      wallet.isValidAddress(receiver) &&
      isPositiveStr(token) &&
      isHex64Str(tokenId) &&
      infos.every((d) => {
        return isPositiveStr(d.type) && isPositiveStr(d.data);
      }) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是铸造NFT信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isTransfer721Topic(data: ITransfer721Topic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, receiver, tokenId, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      wallet.isValidAddress(receiver) &&
      isHex64Str(tokenId) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 是否是销毁NFT信息
   *
   * @param {*} data
   * @returns {boolean}
   * @memberof MultiSignTransaction
   */
  public isDelete721Topic(data: IDelete721Topic): boolean {
    const { type, template, topic } = data || {};
    const { name, description, deadline, operation } = topic || {};
    const { chainId, account, tokenId, memo, seq } = operation || {};
    return (
      type === MEMO_TYPE.MULTI_SIGN &&
      isPositiveStr(template) &&
      data.chainId === this.chainId &&
      isPositiveStr(name) &&
      isPositiveStr(description) &&
      isPositiveInteger(deadline) &&
      chainId === this.chainId &&
      wallet.isValidAddress(account) &&
      isHex64Str(tokenId) &&
      isDef(memo) &&
      Transaction.isSequence(seq)
    );
  }

  /**
   * 转账
   *
   * @param {IMultiTransfer} data
   * @returns {Promise<string>}
   * @memberof MultiSignTransaction
   */
  public async transfer(data: IMultiTransfer): Promise<string> {
    const hash = await transfer(
      Object.assign({}, data, {
        currency: this.token.currency,
        value: this.token.value,
        issuer: this.token.issuer
      })
    );
    return hash;
  }

  /**
   * 账号操作
   *
   * data.disabled = true, 禁用密钥
   *
   * data.disabled = false, 恢复密钥
   *
   * @static
   * @param {IAccountSet} data
   * @returns {Promise<string>}
   * @memberof MultiSignTransaction
   */
  public static async setAccount(data: IAccountSet): Promise<string> {
    const hash = await setAccount(data);
    return hash;
  }

  /**
   * 设置多签名成员
   *
   * @static
   * @param {ISignerList} data
   * @returns {Promise<string>}
   * @memberof MultiSignTransaction
   */
  public static async setSignerList(data: ISignerList): Promise<string> {
    const hash = await setSignerList(data);
    return hash;
  }
}
