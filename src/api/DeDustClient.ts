/**
 * (C) Copyright 2023, Scaleton Labs LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { MAINNET_API_URL } from '../constants';
import axios, { AxiosInstance } from 'axios';
import { Address } from '@ton/core';
import { AssetBalance, PoolData, TradeData } from './types';

const DEFAULT_TIMEOUT = 30_000;

export class DeDustClient {
  private httpClient: AxiosInstance;

  constructor({
    endpointUrl = MAINNET_API_URL,
    timeout,
  }: {
    endpointUrl: string;
    timeout?: number;
  }) {
    this.httpClient = axios.create({
      baseURL: endpointUrl,
      timeout: timeout ?? DEFAULT_TIMEOUT,
    });
  }

  async getAccountAssets(accountAddress: Address): Promise<AssetBalance[]> {
    const { data } = await this.httpClient.get(
      `/v2/accounts/${accountAddress.toString({ urlSafe: true })}/assets`,
    );

    return data;
  }

  async getPools(): Promise<PoolData[]> {
    const { data } = await this.httpClient.get('/v2/pools');
    return data;
  }

  async getPoolTrades(
    poolAddress: Address,
    { afterLT, pageSize }: { afterLT?: bigint; pageSize?: number } = {},
  ): Promise<TradeData[]> {
    const { data } = await this.httpClient.get(
      `/v2/pools/${poolAddress.toString({ urlSafe: true })}/trades`,
      {
        params: {
          page_size: pageSize,
          after_lt: afterLT,
        },
      },
    );

    return data;
  }
}
