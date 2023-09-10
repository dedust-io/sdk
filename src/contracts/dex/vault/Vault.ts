/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Cell, Contract, ContractProvider } from '@ton/core';
import { Asset, ReadinessStatus } from '../common';

export interface SwapStep {
  poolAddress: Address;
  limit?: bigint;
  next?: SwapStep;
}

export interface SwapParams {
  deadline?: number;
  recipientAddress?: Address | null;
  referralAddress?: Address | null;
  fulfillPayload?: Cell | null;
  rejectPayload?: Cell | null;
}

export abstract class Vault implements Contract {
  protected constructor(readonly address: Address) {}

  abstract getReadinessStatus(provider: ContractProvider): Promise<ReadinessStatus>;

  async getAsset(provider: ContractProvider): Promise<Asset> {
    const result = await provider.get('get_asset', []);
    return Asset.fromSlice(result.stack.readCell().asSlice());
  }

  protected static packSwapParams({
    deadline,
    recipientAddress,
    referralAddress,
    fulfillPayload,
    rejectPayload,
  }: SwapParams) {
    return beginCell()
      .storeUint(deadline ?? 0, 32)
      .storeAddress(recipientAddress ?? null)
      .storeAddress(referralAddress ?? null)
      .storeMaybeRef(fulfillPayload)
      .storeMaybeRef(rejectPayload)
      .endCell();
  }

  protected static packSwapStep({ poolAddress, limit, next }: SwapStep): Cell {
    return beginCell()
      .storeAddress(poolAddress)
      .storeUint(0, 1) // reserved
      .storeCoins(limit ?? 0n)
      .storeMaybeRef(next ? Vault.packSwapStep(next) : null)
      .endCell();
  }
}
