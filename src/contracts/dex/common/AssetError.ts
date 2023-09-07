/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export class AssetError extends Error {
  static notSupported() {
    return new AssetError('Asset is not supported.');
  }
}
