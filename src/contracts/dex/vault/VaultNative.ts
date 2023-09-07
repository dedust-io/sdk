/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Cell, ContractProvider, Sender, SendMode, toNano } from '@ton/core';
import { SwapParams, SwapStep, Vault } from './Vault';
import { Asset } from '../common';

export class VaultNative extends Vault {
  static readonly DEPOSIT_LIQUIDITY = 0xd55e4686;
  static readonly SWAP = 0xea06185d;

  protected constructor(readonly address: Address) {
    super(address);
  }

  static createFromAddress(address: Address) {
    return new VaultNative(address);
  }

  async sendDepositLiquidity(
    provider: ContractProvider,
    via: Sender,
    {
      queryId,
      amount,
      isStable,
      assets,
      minimalLPAmount,
      targetBalances,
      fulfillPayload,
      rejectPayload,
    }: {
      queryId?: bigint | number;
      amount: bigint;
      isStable: boolean;
      assets: [Asset, Asset];
      minimalLPAmount?: bigint;
      targetBalances: [bigint, bigint];
      fulfillPayload?: Cell | null;
      rejectPayload?: Cell | null;
    },
  ) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VaultNative.DEPOSIT_LIQUIDITY, 32)
        .storeUint(queryId ?? 0, 64)
        .storeCoins(amount)
        .storeBit(isStable)
        .storeSlice(assets[0].toSlice())
        .storeSlice(assets[1].toSlice())
        .storeRef(
          beginCell()
            .storeCoins(minimalLPAmount ?? 0)
            .storeCoins(targetBalances[0])
            .storeCoins(targetBalances[1])
            .endCell(),
        )
        .storeMaybeRef(fulfillPayload)
        .storeMaybeRef(rejectPayload)
        .endCell(),
      value: amount + toNano('0.15'),
    });
  }

  async sendSwap(
    provider: ContractProvider,
    via: Sender,
    {
      queryId,
      amount,
      poolAddress,
      limit,
      swapParams,
      next,
      gasAmount,
    }: {
      queryId?: bigint | number;
      amount: bigint;
      poolAddress: Address;
      limit?: bigint;
      swapParams?: SwapParams;
      next?: SwapStep;
      gasAmount?: bigint;
    },
  ) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(VaultNative.SWAP, 32)
        .storeUint(queryId ?? 0, 64)
        .storeCoins(amount)
        .storeAddress(poolAddress)
        .storeUint(0, 1)
        .storeCoins(limit ?? 0)
        .storeMaybeRef(next ? Vault.packSwapStep(next) : null)
        .storeRef(Vault.packSwapParams(swapParams ?? {}))
        .endCell(),
      value: amount + (gasAmount ?? toNano('0.2')),
    });
  }
}
