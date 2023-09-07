/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Cell, Contract, ContractProvider } from '@ton/core';

export class JettonRoot implements Contract {
  private constructor(readonly address: Address) {}

  static createFromAddress(address: Address) {
    return new JettonRoot(address);
  }

  async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
    const result = await provider.get('get_wallet_address', [
      { type: 'slice', cell: beginCell().storeAddress(owner).endCell() },
    ]);

    return result.stack.readAddress();
  }

  async getJettonData(provider: ContractProvider): Promise<{
    totalSupply: bigint;
    isMintable: boolean;
    adminAddress: Address | null;
    content: Cell;
    walletCode: Cell;
  }> {
    const result = await provider.get('get_jetton_data', []);
    return {
      totalSupply: result.stack.readBigNumber(),
      isMintable: result.stack.readNumber() !== 0,
      adminAddress: result.stack.readAddressOpt(),
      content: result.stack.readCell(),
      walletCode: result.stack.readCell(),
    };
  }
}
