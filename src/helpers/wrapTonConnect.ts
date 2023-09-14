import type { ITonConnect } from '@tonconnect/sdk';
import { Address, beginCell, Sender, SenderArguments, storeStateInit } from '@ton/core';

const DEFAULT_TTL = 5 * 60 * 1000; // minutes

export const wrapTonConnect = (tonConnect: ITonConnect, ttl: number = DEFAULT_TTL): Sender => {
  return {
    get address(): Address | undefined {
      return tonConnect.account ? Address.parse(tonConnect.account.address) : undefined;
    },

    async send(args: SenderArguments): Promise<void> {
      await tonConnect.sendTransaction({
        validUntil: Date.now() + ttl,
        messages: [
          {
            address: args.to.toString(),
            amount: args.value.toString(10),
            stateInit: args.init
              ? beginCell()
                  .storeWritable(storeStateInit(args.init))
                  .endCell()
                  .toBoc()
                  .toString('base64')
              : undefined,
            payload: args.body?.toBoc().toString('base64'),
          },
        ],
      });
    },
  };
};
