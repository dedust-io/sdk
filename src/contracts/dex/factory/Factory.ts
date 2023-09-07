/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Address,
  beginCell,
  Contract,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from '@ton/core';
import { PoolType } from '../pool';
import { Asset } from '../common';

export class Factory implements Contract {
  static readonly CREATE_VAULT = 0x21cfe02b;
  static readonly CREATE_VOLATILE_POOL = 0x97d51f2f;

  protected constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new Factory(address);
  }

  async sendCreateVault(
    provider: ContractProvider,
    via: Sender,
    { queryId, asset }: { queryId?: number | bigint; asset: Asset },
  ) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Factory.CREATE_VAULT, 32)
        .storeUint(queryId ?? 0, 64)
        .storeSlice(asset.toSlice())
        .endCell(),
      value: toNano('0.1'),
    });
  }

  async getVaultAddress(provider: ContractProvider, asset: Asset): Promise<Address> {
    const result = await provider.get('get_vault_address', [
      { type: 'slice', cell: asset.toSlice().asCell() },
    ]);

    return result.stack.readAddress();
  }

  async sendCreateVolatilePool(
    provider: ContractProvider,
    via: Sender,
    { queryId, assets }: { queryId?: number | bigint; assets: [Asset, Asset] },
  ) {
    await provider.internal(via, {
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Factory.CREATE_VOLATILE_POOL, 32)
        .storeUint(queryId ?? 0, 64)
        .storeSlice(assets[0].toSlice())
        .storeSlice(assets[1].toSlice())
        .endCell(),
      value: toNano('0.25'),
    });
  }

  async getPoolAddress(
    provider: ContractProvider,
    {
      poolType,
      assets,
    }: {
      poolType: PoolType;
      assets: [Asset, Asset];
    },
  ): Promise<Address> {
    const result = await provider.get('get_pool_address', [
      { type: 'int', value: BigInt(poolType) },
      { type: 'slice', cell: assets[0].toSlice().asCell() },
      { type: 'slice', cell: assets[1].toSlice().asCell() },
    ]);

    return result.stack.readAddress();
  }

  async getLiquidityDepositAddress(
    provider: ContractProvider,
    {
      ownerAddress,
      isStable,
      assets,
    }: {
      ownerAddress: Address;
      isStable: boolean;
      assets: [Asset, Asset];
    },
  ): Promise<Address> {
    const result = await provider.get('get_liquidity_deposit_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(ownerAddress).asCell(),
      },
      { type: 'int', value: BigInt(isStable) },
      { type: 'slice', cell: assets[0].toSlice().asCell() },
      { type: 'slice', cell: assets[1].toSlice().asCell() },
    ]);

    return result.stack.readAddress();
  }
}
