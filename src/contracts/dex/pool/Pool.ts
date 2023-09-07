/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, Contract, ContractProvider } from '@ton/core';
import { Asset } from '../common';
import { PoolType } from './PoolType';

export class Pool implements Contract {
  protected constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Pool(address);
  }

  async getPoolType(provider: ContractProvider): Promise<PoolType> {
    const result = await provider.get('is_stable', []);
    return result.stack.readNumber();
  }

  async getAssets(provider: ContractProvider): Promise<[Asset, Asset]> {
    const result = await provider.get('get_assets', []);
    return [
      Asset.fromSlice(result.stack.readCell().asSlice()),
      Asset.fromSlice(result.stack.readCell().asSlice()),
    ];
  }

  async getEstimatedSwapOut(
    provider: ContractProvider,
    {
      assetIn,
      amountIn,
    }: {
      assetIn: Asset;
      amountIn: bigint;
    },
  ): Promise<{
    assetOut: Asset;
    amountOut: bigint;
    tradeFee: bigint;
  }> {
    const result = await provider.get('estimate_swap_out', [
      {
        type: 'slice',
        cell: assetIn.toSlice().asCell(),
      },
      {
        type: 'int',
        value: amountIn,
      },
    ]);

    return {
      assetOut: Asset.fromSlice(result.stack.readCell().asSlice()),
      amountOut: result.stack.readBigNumber(),
      tradeFee: result.stack.readBigNumber(),
    };
  }

  async getEstimateDepositOut(
    provider: ContractProvider,
    amounts: [bigint, bigint],
  ): Promise<{
    deposits: [bigint, bigint];
    fairSupply: bigint;
  }> {
    const result = await provider.get('estimate_deposit_out', [
      {
        type: 'int',
        value: amounts[0],
      },
      {
        type: 'int',
        value: amounts[1],
      },
    ]);

    return {
      deposits: [result.stack.readBigNumber(), result.stack.readBigNumber()],
      fairSupply: result.stack.readBigNumber(),
    };
  }

  async getReserves(provider: ContractProvider): Promise<[bigint, bigint]> {
    const result = await provider.get('get_reserves', []);
    return [result.stack.readBigNumber(), result.stack.readBigNumber()];
  }

  async getTradeFee(provider: ContractProvider): Promise<number> {
    const result = await provider.get('get_trade_fee', []);

    const numerator = result.stack.readNumber();
    const denominator = result.stack.readNumber();

    return numerator / denominator;
  }
}
