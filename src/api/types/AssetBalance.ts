/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetRef } from './AssetRef';

export interface AssetBalance {
  /**
   * Either address of jetton minter (for jettons) or user wallet address (for native).
   */
  address: string;

  asset: AssetRef;

  balance: string;
}
