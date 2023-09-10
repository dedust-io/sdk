/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Cell, ContractProvider } from '@ton/core';
import { SwapParams, SwapStep, Vault } from './Vault';
import { Asset, ReadinessStatus } from '../common';

export class VaultJetton extends Vault {
  static readonly DEPOSIT_LIQUIDITY = 0x40e108d6;
  static readonly SWAP = 0xe3a0d482;

  protected constructor(readonly address: Address) {
    super(address);
  }

  static createFromAddress(address: Address) {
    return new VaultJetton(address);
  }

  async getReadinessStatus(provider: ContractProvider): Promise<ReadinessStatus> {
    const state = await provider.getState();
    if (state.state.type !== 'active') {
      return ReadinessStatus.NOT_DEPLOYED;
    }

    const { stack } = await provider.get('is_ready', []);

    return stack.readBoolean() ? ReadinessStatus.READY : ReadinessStatus.NOT_READY;
  }

  /**
   * deposit_liquidity pool_ref:PoolRef min_lp_amount:Coins
   *                   asset0_target_balance:Coins asset1_target_balance:Coins
   *                   fulfill_payload:(Maybe ^Cell) reject_payload:(Maybe ^Cell) = ForwardPayload;
   */
  static createDepositLiquidityPayload({
    isStable,
    assets,
    minimalLpAmount,
    targetBalances,
    fulfillPayload,
    rejectPayload,
  }: {
    isStable: boolean;
    assets: [Asset, Asset];
    minimalLpAmount?: bigint;
    targetBalances: [bigint, bigint];
    fulfillPayload?: Cell | null;
    rejectPayload?: Cell | null;
  }): Cell {
    return beginCell()
      .storeUint(VaultJetton.DEPOSIT_LIQUIDITY, 32)
      .storeBit(isStable)
      .storeSlice(assets[0].toSlice())
      .storeSlice(assets[1].toSlice())
      .storeCoins(minimalLpAmount ?? 0)
      .storeCoins(targetBalances[0])
      .storeCoins(targetBalances[1])
      .storeMaybeRef(fulfillPayload)
      .storeMaybeRef(rejectPayload)
      .endCell();
  }

  static createSwapPayload({
    poolAddress,
    limit,
    swapParams,
    next,
  }: {
    poolAddress: Address;
    limit?: bigint;
    swapParams?: SwapParams;
    next?: SwapStep;
  }) {
    return beginCell()
      .storeUint(VaultJetton.SWAP, 32)
      .storeAddress(poolAddress)
      .storeUint(0, 1) // reserved
      .storeCoins(limit ?? 0)
      .storeMaybeRef(next ? Vault.packSwapStep(next) : null)
      .storeRef(Vault.packSwapParams(swapParams ?? {}))
      .endCell();
  }
}
