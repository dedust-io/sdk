/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetType } from './AssetType';
import { Address, beginCell, Builder, Slice, Writable } from '@ton/core';
import { AssetError } from './AssetError';

export class Asset implements Writable {
  private constructor(
    readonly type: AssetType,
    readonly address?: Address,
  ) {}

  static native() {
    return new Asset(AssetType.NATIVE);
  }

  static jetton(minter: Address) {
    return new Asset(AssetType.JETTON, minter);
  }

  static fromSlice(src: Slice): Asset {
    const assetType = src.loadUint(4);
    switch (assetType) {
      case AssetType.NATIVE:
        return Asset.native();

      case AssetType.JETTON:
        return Asset.jetton(new Address(src.loadInt(8), src.loadBuffer(32)));

      default:
        throw AssetError.notSupported();
    }
  }

  equals(other: Asset) {
    return this.toString() === other.toString();
  }

  writeTo(builder: Builder) {
    switch (this.type) {
      case AssetType.NATIVE:
        builder.storeUint(AssetType.NATIVE, 4);
        break;

      case AssetType.JETTON:
        builder
          .storeUint(AssetType.JETTON, 4)
          .storeInt(this.address!.workChain!, 8)
          .storeBuffer(this.address!.hash!);
        break;

      default:
        throw AssetError.notSupported();
    }
  }

  toSlice(): Slice {
    return beginCell().storeWritable(this).endCell().beginParse();
  }

  toString() {
    switch (this.type) {
      case AssetType.NATIVE:
        return `native`;

      case AssetType.JETTON:
        return `jetton:${this.address!.toString()}`;

      default:
        throw AssetError.notSupported();
    }
  }
}
