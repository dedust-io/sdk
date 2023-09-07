/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetMetadata } from './AssetMetadata';

export type AssetRef =
  | {
      type: 'native';
    }
  | {
      type: 'jetton';
      address: string;
    };

export type AssetRefWithMetadata = AssetRef & {
  metadata: AssetMetadata;
};
