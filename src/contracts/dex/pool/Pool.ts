/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Cell, Contract, ContractProvider } from '@ton/core';
import { Asset, ReadinessStatus } from '../common';
import { PoolType } from './PoolType';
import { JettonWallet } from '../../jettons';

export class Pool implements Contract {
  protected constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Pool(address);
  }

  async getReadinessStatus(provider: ContractProvider): Promise<ReadinessStatus> {
    const state = await provider.getState();
    if (state.state.type !== 'active') {
      return ReadinessStatus.NOT_DEPLOYED;
    }

    const reserves = await this.getReserves(provider);

    return reserves[0] > 0n && reserves[1] > 0n ? ReadinessStatus.READY : ReadinessStatus.NOT_READY;
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

  async getWalletAddress(provider: ContractProvider, ownerAddress: Address): Promise<Address> {
    const result = await provider.get('get_wallet_address', [
      { type: 'slice', cell: beginCell().storeAddress(ownerAddress).endCell() },
    ]);

    return result.stack.readAddress();
  }

  async getWallet(provider: ContractProvider, ownerAddress: Address): Promise<JettonWallet> {
    return JettonWallet.createFromAddress(await this.getWalletAddress(provider, ownerAddress));
  }
}
