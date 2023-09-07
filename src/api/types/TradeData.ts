/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetRef } from './AssetRef';

export interface TradeData {
  sender: string;
  assetIn: AssetRef;
  assetOut: AssetRef;
  amountIn: string;
  amountOut: string;
  lt: string;
  createdAt: string;
}
