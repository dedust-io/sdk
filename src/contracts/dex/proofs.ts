/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Address, beginCell, Builder, Cell, Writable } from '@ton/core';
import { Asset, ContractType } from './common';
import { BLANK_CODE } from '../../constants';

export function createStateInit(code: Cell, data: Cell): Cell {
  return beginCell()
    .storeUint(0, 2) // split_depth:(Maybe (## 5)) special:(Maybe TickTock)
    .storeMaybeRef(code) // code:(Maybe ^Cell)
    .storeMaybeRef(data) // data:(Maybe ^Cell)
    .storeDict(null) // library:(HashmapE 256 SimpleLib)
    .endCell();
}

export function createProof(
  factoryAddress: Address,
  contractType: ContractType,
  params: ((builder: Builder) => void) | Writable,
): Cell {
  return createStateInit(
    BLANK_CODE,
    beginCell()
      .storeAddress(factoryAddress)
      .storeUint(contractType, 8)
      .storeWritable(params)
      .endCell(),
  );
}

export function createVaultProof(factoryAddress: Address, asset: Asset): Cell {
  return createProof(factoryAddress, ContractType.VAULT, asset);
}

export function verifyVaultAddress(
  vaultAddress: Address,
  factoryAddress: Address,
  asset: Asset,
): boolean {
  const proof = createVaultProof(factoryAddress, asset);
  return vaultAddress.workChain === 0 && vaultAddress.hash.equals(proof.hash());
}
