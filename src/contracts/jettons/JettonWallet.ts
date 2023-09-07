/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode } from '@ton/core';

export class JettonWallet implements Contract {
  static readonly TRANSFER = 0xf8a7ea5;
  static readonly TRANSFER_NOTIFICATION = 0x7362d09c;
  static readonly INTERNAL_TRANSFER = 0x178d4519;
  static readonly BURN = 0x595f07bc;
  static readonly EXCESSES = 0xd53276db;

  constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new JettonWallet(address);
  }

  async sendTransfer(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    {
      queryId,
      amount,
      destination,
      responseAddress,
      customPayload,
      forwardAmount,
      forwardPayload,
    }: {
      queryId?: number | bigint;
      destination: Address;
      amount: bigint;
      responseAddress?: Address | null;
      customPayload?: Cell;
      forwardAmount?: bigint;
      forwardPayload?: Cell;
    },
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(JettonWallet.TRANSFER, 32)
        .storeUint(queryId ?? 0, 64)
        .storeCoins(amount)
        .storeAddress(destination)
        .storeAddress(responseAddress)
        .storeMaybeRef(customPayload)
        .storeCoins(forwardAmount ?? 0)
        .storeMaybeRef(forwardPayload)
        .endCell(),
    });
  }

  async sendBurn(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    {
      queryId,
      amount,
      responseAddress,
      customPayload,
    }: {
      queryId?: number | bigint;
      amount: bigint;
      responseAddress?: Address | null;
      customPayload?: Cell;
    },
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(JettonWallet.BURN, 32)
        .storeUint(queryId ?? 0, 64)
        .storeCoins(amount)
        .storeAddress(responseAddress)
        .storeMaybeRef(customPayload)
        .endCell(),
    });
  }

  async getWalletData(provider: ContractProvider): Promise<{
    balance: bigint;
    ownerAddress: Address;
    minterAddress: Address;
    walletCode: Cell;
  }> {
    const result = await provider.get('get_wallet_data', []);

    const balance = result.stack.readBigNumber();
    const ownerAddress = result.stack.readAddress();
    const minterAddress = result.stack.readAddress();
    const walletCode = result.stack.readCell();

    return {
      balance,
      ownerAddress,
      minterAddress,
      walletCode,
    };
  }

  async getBalance(provider: ContractProvider): Promise<bigint> {
    const { balance } = await this.getWalletData(provider);
    return balance;
  }
}
