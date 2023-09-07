/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetRefWithMetadata } from './AssetRef';

export interface PoolData {
  address: string;
  lt: string;
  totalSupply: string;
  type: 'volatile' | 'stable';
  tradeFee: string;
  assets: [AssetRefWithMetadata, AssetRefWithMetadata];
  lastPrice: string;
  reserves: [string, string];
  stats: {
    fees: [string, string];
    volume: [string, string];
  };
}
