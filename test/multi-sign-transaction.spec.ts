import { test, describe, expect } from "@jest/globals";
import MultiSignTransaction from "../src/multi-sign-transaction";
import {
  enableTopic,
  paymentTopic,
  signerTopic,
  createOrderTopic,
  cancelOrderTopic,
  setLimitTopic,
  setBlackListTopic,
  removeBlackListTopic,
  issueSetTopic,
  setTokenIssueTopic,
  publish721Topic,
  transfer721Topic,
  delete721Topic
} from "./data";

describe("test MultiSignTransaction", () => {
  const multiSignTransaction = new MultiSignTransaction({
    token: {
      currency: "SWT",
      issuer: "",
      value: "1"
    }
  });

  describe("test isPaymentTopic & serializePaymentTopic API", () => {
    test("data is payment topic", async () => {
      const d = multiSignTransaction.serializePaymentTopic({
        name: "奖励Bob 200USDT",
        description: "鉴于Bob发现并报告了软件中的BUG，特此奖励",
        deadline: 1658129891,
        from: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        to: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
        memo: "",
        seq: 44,
        token: {
          currency: "JUSDT",
          value: "200",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or"
        }
      });

      expect(d).toEqual(paymentTopic);

      expect(multiSignTransaction.isPaymentTopic(d)).toEqual(true);
    });
  });

  describe("test isEnableTopic & serializeEnableTopic API", () => {
    test("data is enable topic", async () => {
      const d = multiSignTransaction.serializeEnableTopic({
        name: "恢复密钥",
        description: "恢复jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp钱包密钥",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        seq: 45
      });

      expect(d).toEqual(enableTopic);

      expect(multiSignTransaction.isEnableTopic(d)).toEqual(true);
    });
  });

  describe("test isSignerSetTopic & serializeSignerSetTopic API", () => {
    test("data is signer set topic", async () => {
      const d = multiSignTransaction.serializeSignerSetTopic({
        name: "多签成员管理",
        description: "多签成员管理",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        seq: 46,
        threshold: 2,
        lists: [
          {
            account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
            weight: 1
          },
          {
            account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
            weight: 1
          }
        ]
      });
      expect(d).toEqual(signerTopic);

      expect(multiSignTransaction.isSignerSetTopic(d)).toEqual(true);

      const invalidTopics = [
        {
          type: "multi-sig",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 0,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013c",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvL",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: -1,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 0,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KT",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 1
                }
              ]
            }
          }
        },
        {
          type: "multi-sign",
          template: "多签成员管理",
          chainId: "0x8000013b",
          topic: {
            name: "多签成员管理",
            description: "多签成员管理",
            deadline: 1658129891,
            operation: {
              chainId: "0x8000013b",
              account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
              seq: 46,
              threshold: 2,
              lists: [
                {
                  account: "jN2V3iXhzXZY3WjtEkgZwxyhgPwEyC3KTX",
                  weight: 1
                },
                {
                  account: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
                  weight: 0
                }
              ]
            }
          }
        }
      ];
      for (const topic of invalidTopics) {
        expect(multiSignTransaction.isSignerSetTopic(topic)).toEqual(false);
      }
    });
  });

  describe("test isCreateOrderTopic & serializeCreateOrderTopic API", () => {
    test("data is createOrder topic", async () => {
      const d = multiSignTransaction.serializeCreateOrderTopic({
        name: "用SWTC换取USDT",
        description: "缺少USDT 故用2 STWC 换取 2 USDT",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        memo: "",
        seq: 45,
        taker_pays: {
          currency: "SWT",
          issuer: "",
          value: 2
        },
        taker_gets: {
          currency: "JUSDT",
          issuer: "jGa9J9TkqtBcUoHe2zqhVFFbgUVED6o9or",
          value: 2
        }
      });

      expect(d).toEqual(createOrderTopic);

      expect(multiSignTransaction.isCreateOrderTopic(d)).toEqual(true);
    });
  });

  describe("test isCancelOrderTopic & serializeCancelOrderTopic API", () => {
    test("data is cancelOrder topic", async () => {
      const d = multiSignTransaction.serializeCancelOrderTopic({
        name: "撤销换取USDT",
        description: "USDT够了 故撤销换取USDT",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        orderSeq: 46,
        seq: 47
      });

      expect(d).toEqual(cancelOrderTopic);

      expect(multiSignTransaction.isCancelOrderTopic(d)).toEqual(true);
    });
  });

  describe("test isSetLimitTopic & serializeSetLimitTopic API", () => {
    test("data is setLimit topic", async () => {
      const d = multiSignTransaction.serializeSetLimitTopic({
        name: "设置资产上限",
        description: "为了方便管理 故设置多签账号的资产上限为20000个SWTC",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        limit: {
          currency: "SWT",
          issuer: "",
          value: 20000
        },
        memo: "",
        seq: 48
      });

      expect(d).toEqual(setLimitTopic);

      expect(multiSignTransaction.isSetLimitTopic(d)).toEqual(true);
    });
  });

  describe("test isSetBlackListTopic & serializeSetBlackListTopic API", () => {
    test("data is setBlackList topic", async () => {
      const d = multiSignTransaction.serializeSetBlackListTopic({
        name: "冻结账号",
        description: "因为j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j违规操作,故冻结该账号",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        blockAccount: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
        memo: "",
        seq: 49
      });

      expect(d).toEqual(setBlackListTopic);

      expect(multiSignTransaction.isSetBlackListTopic(d)).toEqual(true);
    });
  });

  describe("test isRemoveBlackListTopic & serializeRemoveBlackListTopic API", () => {
    test("data is removeBlackList topic", async () => {
      const d = multiSignTransaction.serializeRemoveBlackListTopic({
        name: "解冻账号",
        description: "因为j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j持有人做出贡献,故解冻该账号",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        blockAccount: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
        memo: "",
        seq: 50
      });

      expect(d).toEqual(removeBlackListTopic);

      expect(multiSignTransaction.isRemoveBlackListTopic(d)).toEqual(true);
    });
  });

  describe("test isIssueSetTopic & serializeIssueSetTopic API", () => {
    test("data is issueSet topic", async () => {
      const d = multiSignTransaction.serializeIssueSetTopic({
        name: "通证发行",
        description: "应某超市要求，发行该超市10000000个通证",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        amount: {
          currency: "mmt",
          issuer: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
          value: 10000000
        },
        memo: "",
        seq: 51
      });

      expect(d).toEqual(issueSetTopic);

      expect(multiSignTransaction.isIssueSetTopic(d)).toEqual(true);
    });
  });

  describe("test isSetTokenIssueTopic & serializeSetTokenIssueTopic API", () => {
    test("data is setTokenIssue topic", async () => {
      const d = multiSignTransaction.serializeSetTokenIssueTopic({
        name: "NFT发行",
        description: "因图片精美,故将该图片做成nft",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        publisher: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        token: "某某图片",
        number: 1,
        memo: "",
        seq: 52
      });

      expect(d).toEqual(setTokenIssueTopic);

      expect(multiSignTransaction.isSetTokenIssueTopic(d)).toEqual(true);
    });
  });

  describe("test isPublish721Topic & serializePublish721Topic API", () => {
    test("data is publish721 topic", async () => {
      const d = multiSignTransaction.serializePublish721Topic({
        name: "铸造NFT",
        description: "因图片精美,故将该图片铸造成nft",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        receiver: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
        token: "某某图片",
        tokenId: "45323444463335372D384144352D343945412D423837342D3943313644333937",
        infos: [
          {
            type: "jpg",
            data: "1"
          },
          {
            type: "jpg",
            data: "2"
          }
        ],
        seq: 52
      });

      expect(d).toEqual(publish721Topic);

      expect(multiSignTransaction.isPublish721Topic(d)).toEqual(true);

      const publish721Topic1 = {
        type: "multi-sign",
        template: "铸造NFT",
        chainId: "0x8000013b",
        topic: {
          name: "铸造NFT",
          description: "因图片精美,故将该图片铸造成nft",
          deadline: 1658129891,
          operation: {
            chainId: "0x8000013b",
            account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
            receiver: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
            token: "某某图片",
            tokenId: "45323444463335372D384144352D343945412D423837342D3943313644333937",
            infos: [],
            seq: 52
          }
        }
      };

      const d1 = multiSignTransaction.serializePublish721Topic({
        name: "铸造NFT",
        description: "因图片精美,故将该图片铸造成nft",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        receiver: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
        token: "某某图片",
        tokenId: "45323444463335372D384144352D343945412D423837342D3943313644333937",
        infos: undefined,
        seq: 52
      });

      expect(d1).toEqual(publish721Topic1);

      expect(multiSignTransaction.isPublish721Topic(d1)).toEqual(true);
    });
  });

  describe("test isTransfer721Topic & serializeTransfer721Topic API", () => {
    test("data is transfer721 topic", async () => {
      const d = multiSignTransaction.serializeTransfer721Topic({
        name: "NFT转账",
        description: "因j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j做出贡献,故将这个NFT给他",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        receiver: "j9iWN6W7bbiRnSq3zx5fm83hLJwaferH3j",
        tokenId: "45323444463335372D384144352D343945412D423837342D3943313644333937",
        memo: "",
        seq: 52
      });

      expect(d).toEqual(transfer721Topic);

      expect(multiSignTransaction.isTransfer721Topic(d)).toEqual(true);
    });
  });

  describe("test isDelete721Topic & serializeDelete721Topic API", () => {
    test("data is delete721 topic", async () => {
      const d = multiSignTransaction.serializeDelete721Topic({
        name: "销毁NFT",
        description: "因NFT无人接手,故将这个NFT销毁",
        deadline: 1658129891,
        account: "jUtvJZtgZjRrz5jFC3VKg4mrnnJfWrLvLp",
        tokenId: "45323444463335372D384144352D343945412D423837342D3943313644333937",
        memo: "",
        seq: 52
      });

      expect(d).toEqual(delete721Topic);

      expect(multiSignTransaction.isDelete721Topic(d)).toEqual(true);
    });
  });

  describe("test isPayload API", () => {
    test("data is payload", async () => {
      const data = {
        type: "payload",
        id: "1",
        total: 3,
        number: 1,
        payload: "010100"
      };

      expect(multiSignTransaction.isPayload(data)).toEqual(true);

      expect(
        multiSignTransaction.serializePayload({
          id: "1",
          total: 3,
          number: 1,
          payload: "010100"
        })
      ).toEqual(data);
    });
  });

  describe("test isRegisterAction ", () => {
    test("data is register", () => {
      const data = multiSignTransaction.serializeRegister("jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D");

      expect(data).toEqual({
        type: "name-service",
        action: "register",
        account: "jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D",
        category: "multiSign"
      });
    });
  });

  describe("test isUnregisterAction ", () => {
    test("data is register", () => {
      const data = multiSignTransaction.serializeUnregister("jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D");

      expect(data).toEqual({
        type: "name-service",
        action: "unregister",
        account: "jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D",
        category: "multiSign"
      });
    });
  });

  describe("test isVote API", () => {
    test("data is vote", async () => {
      const account = "jG4MZDywwxisf3G3az48cT3EamRxtbmbPB";
      const multisignMember = {
        address: "jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D",
        secret: "ssSbnZCoYbBGyMqeafUQ2esKi6nJS"
      };

      const tx = {
        Account: account,
        Amount: "0.1",
        Destination: "jMCjtHzgrMvjt2EugYsqpxKtx6Z86gKo8X",
        Fee: 0.00001,
        Flags: 0,
        TransactionType: "Payment",
        Sequence: 1
      };

      const multisigned = await multiSignTransaction.multiSign({
        tx,
        secret: multisignMember.secret
      });

      const vote = multiSignTransaction.serializeVote({
        account: multisignMember.address,
        deadline: 10000,
        multiSign: multisigned,
        md5: "eef93004736dd56b59dda11858fa1859"
      });

      expect(vote).toEqual({
        type: "oracle",
        action: "multiSign",
        chainId: "0x8000013b",
        account: "jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D",
        topicMd5: "eef93004736dd56b59dda11858fa1859",
        deadline: 10000,
        multiSign: {
          Account: "jG4MZDywwxisf3G3az48cT3EamRxtbmbPB",
          Amount: "100000",
          Destination: "jMCjtHzgrMvjt2EugYsqpxKtx6Z86gKo8X",
          Fee: "80000",
          Flags: 0,
          TransactionType: "Payment",
          Sequence: 1,
          SigningPubKey: "",
          Signers: [
            {
              Signer: {
                Account: "jMeNCYoA1YEK6t2Nb2QJTiuJcMDvUmqD8D",
                SigningPubKey: "02A4344F0DBB3C4046EB8D8A86202CCDEC87D2BA8CD537323B08CC985AED875438",
                TxnSignature:
                  "3045022100B34A6E1DA30BD7DCF43D8687870D3A7FAE4FF0F49466235AB4F38EF7116AE426022033F3D82267B72144AA5ABC17C9A3F945EF451333663AE35E3AE1902AF18AA353"
              }
            }
          ]
        }
      });
      expect(multiSignTransaction.isVote(vote)).toEqual(true);
    });
  });
});
