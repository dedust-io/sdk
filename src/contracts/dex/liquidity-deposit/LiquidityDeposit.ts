/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from '@ton/core';
import { Asset, ReadinessStatus } from '../common';
import { PoolType } from '../pool';

export class LiquidityDeposit implements Contract {
  static readonly CANCEL_DEPOSIT = 0x166cedee;

  protected constructor(readonly address: Address) {}

  static createFromAddress(address: Address): LiquidityDeposit {
    return new LiquidityDeposit(address);
  }

  async getOwnerAddress(provider: ContractProvider): Promise<Address> {
    const result = await provider.get('get_owner_addr', []);
    return result.stack.readAddress();
  }

  async getPoolAddress(provider: ContractProvider): Promise<Address> {
    const result = await provider.get('get_pool_addr', []);
    return result.stack.readAddress();
  }

  async getPoolParams(
    provider: ContractProvider,
  ): Promise<{ poolType: PoolType; assets: [Asset, Asset] }> {
    const result = await provider.get('get_pool_params', []);

    const poolType = result.stack.readNumber();
    const assets: [Asset, Asset] = [
      Asset.fromSlice(result.stack.readCell().asSlice()),
      Asset.fromSlice(result.stack.readCell().asSlice()),
    ];

    return {
      poolType,
      assets,
    };
  }

  async getTargetBalances(provider: ContractProvider): Promise<[bigint, bigint]> {
    const result = await provider.get('get_target_balances', []);
    return [result.stack.readBigNumber(), result.stack.readBigNumber()];
  }

  async getBalances(provider: ContractProvider): Promise<[bigint, bigint]> {
    const result = await provider.get('get_balances', []);
    return [result.stack.readBigNumber(), result.stack.readBigNumber()];
  }

  async getIsProcessing(provider: ContractProvider): Promise<boolean> {
    const result = await provider.get('is_processing', []);
    return !!result.stack.readNumber();
  }

  async getMinimalLPAmount(provider: ContractProvider): Promise<bigint> {
    const result = await provider.get('get_min_lp_amount', []);
    return result.stack.readBigNumber();
  }

  async getReadinessStatus(provider: ContractProvider): Promise<ReadinessStatus> {
    const state = await provider.getState();

    if (state.state.type !== 'active') {
      return ReadinessStatus.NOT_DEPLOYED;
    }

    return ReadinessStatus.READY;
  }

  async sendCancelDeposit(
    provider: ContractProvider,
    via: Sender,
    { queryId, payload }: { queryId?: number | bigint; payload?: Cell | null },
  ) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(LiquidityDeposit.CANCEL_DEPOSIT, 32)
        .storeUint(queryId ?? 0, 64)
        .storeMaybeRef(payload ?? null)
        .endCell(),
      value: toNano('0.5'),
    });
  }
}
