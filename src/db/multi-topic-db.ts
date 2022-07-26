import { IBaseMultisignTx, IVote } from "../types";
import { ISign, ISignerEntry, ITopic, ITopics, TopicStatus } from "../types/db";
import BaseDB from "./base-db";
const cloneDeep = require("lodash.clonedeep");

export default class MultiTopicDB extends BaseDB<ITopics> {
  constructor(file: string) {
    super(file);
  }

  protected initData() {
    this.db.data = Object.assign(
      {
        topics: [],
        signs: []
      },
      this.db.data
    );
  }

  /**
   * 插入topic
   *
   * @param {*} data
   * @memberof MultiTopicDB
   */
  insertTopic(data: ITopic) {
    const topics = this.db.chain.get("topics").value();

    const topic = topics.find((t) => t.md5 === data?.md5);

    if (!topic) {
      topics.push(data);
    }
  }

  /**
   * 插入签名
   *
   * @param {*} data
   * @memberof MultiTopicDB
   */
  insertSign(data: ISign) {
    const signs = this.db.chain.get("signs").value();

    const sign = signs.find((t) => t.md5 === data?.md5);
    if (!sign) {
      signs.push(data);
    }
  }

  /**
   * 未执行topics
   *
   * @returns
   * @memberof MultiTopicDB
   */
  unexecutedTopics(): ITopic[] {
    return this.db.chain
      .get("topics")
      .filter({
        executeStatus: TopicStatus.UNEXECUTED
      })
      .value();
  }

  /**
   * 根据指定地址签名的topics
   *
   * @param {string} address
   *
   * @returns {ITopic[]}
   * @memberof MultiTopicDB
   */
  filterSignedTopics(address: string): ITopic[] {
    return this.db.chain
      .get("topics")
      .filter({
        executeStatus: TopicStatus.UNEXECUTED
      })
      .filter((t) => {
        const signs = this.filterSignsByMd5(t.md5).map((s) => s.account);
        return signs.includes(address);
      })
      .value();
  }

  /**
   * 根据指定地址未签名的topics
   *
   * @param {string} address
   *
   * @returns {ITopic[]}
   * @memberof MultiTopicDB
   */
  filterUnsignedTopics(address: string): ITopic[] {
    return this.db.chain
      .get("topics")
      .filter({
        executeStatus: TopicStatus.UNEXECUTED
      })
      .filter((t) => {
        const signs = this.filterSignsByMd5(t.md5).map((s) => s.account);
        return !signs.includes(address);
      })
      .value();
  }

  /**
   * 过期topics
   *
   * @returns {ITopic[]}
   * @memberof MultiTopicDB
   */
  expiredTopics(): ITopic[] {
    return this.db.chain
      .get("topics")
      .filter({
        executeStatus: TopicStatus.EXPIRED
      })
      .value();
  }

  /**
   * 更新topic status & hash
   *
   * @param {string} md5
   * @param {TopicStatus} status
   * @param {string} hash
   * @memberof MultiTopicDB
   */
  updateTopic(md5: string, status: TopicStatus, hash: string) {
    const topic = this.db.chain
      .get("topics")
      .find((t) => t.md5 === md5)
      .value();
    if (topic) {
      topic.executeStatus = status;
      topic.hash = hash;
    }
  }

  /**
   * 成功的topics
   *
   * @returns
   * @memberof MultiTopicDB
   */
  successfulTopics(): ITopic[] {
    return this.db.chain
      .get("topics")
      .filter({
        executeStatus: TopicStatus.SUCCESS
      })
      .value();
  }

  /**
   * 失败的topics
   *
   * @returns
   * @memberof MultiTopicDB
   */
  failedTopics(): ITopic[] {
    return this.db.chain
      .get("topics")
      .filter({
        executeStatus: TopicStatus.FAIL
      })
      .value();
  }

  /**
   * 根据topic md5获取所有签名
   *
   * @param {string} md5
   * @returns {IVote[]}
   * @memberof MultiTopicDB
   */
  filterSignsByMd5(md5: string): IVote[] {
    return this.db.chain
      .get("signs")
      .filter((s) => s.data.topicMd5 === md5)
      .map((s) => s.data)
      .value();
  }

  /**
   * 根据md5查找topic
   *
   * @param {string} md5
   * @returns {ITopic}
   * @memberof MultiTopicDB
   */
  findTopicByMd5(md5: string): ITopic {
    return this.db.chain
      .get("topics")
      .find((t) => t.md5 === md5)
      .value();
  }

  /**
   * 根据topic md5移除signs
   *
   * @param {number} seq
   * @returns
   * @memberof MultiTopicDB
   */
  removeSignsByMd5(md5: string) {
    return this.db.chain
      .get("signs")
      .remove((sign) => sign.data.topicMd5 === md5)
      .value();
  }

  /**
   * 根据多签成员过滤签名
   *
   * @param {IVote[]} votes
   * @param {ISignerEntry[]} signers
   * @memberof MultiTopicDB
   */
  static filterSignsBySigner(votes: IVote[], signers: ISignerEntry[]) {
    const accounts = signers.map((s) => s.account);
    return votes.filter((v) => accounts.includes(v.account));
  }

  /**
   * 判断是否超过topic quorum
   *
   * @static
   * @param {IVote[]} votes
   * @param {ISignerEntry[]} signers
   * @param {number} quorum
   * @returns {boolean}
   * @memberof MultiTopicDB
   */
  static matchQuorum(votes: IVote[], signers: ISignerEntry[], quorum: number): boolean {
    const voteAccounts = votes.map((t) => t.account);

    const voteQuorum = signers
      .filter((s) => voteAccounts.includes(s.account))
      .map((v) => v.weight)
      .reduce((a, b) => a + b, 0);

    return voteQuorum >= quorum;
  }

  /**
   * 拼接vote信息
   *
   * @static
   * @param {IVote[]} votes
   * @returns {IBaseMultisignTx}
   * @memberof MultiTopicDB
   */
  static parseVote(votes: IVote[]): IBaseMultisignTx {
    const signs = cloneDeep(votes.map((v) => v.multiSign));
    const sign = signs[0];
    sign.Signers = signs.map((s) => s.Signers[0]);
    return sign;
  }
}
