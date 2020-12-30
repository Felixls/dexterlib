import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';

export class Harbinger {
  private tezos: TezosToolkit;
  private contractAddress = 'KT1Jr5t9UvGiqkvvsuUbPJHaYx24NzdUwNW9';

  constructor(toolkit: TezosToolkit) {
    this.tezos = toolkit;
  }

  async getPrice(pair: string): Promise<BigNumber> {
    try {
      const contract = await this.tezos.contract.at(this.contractAddress);
      const storage: any = await contract.storage();

      const oracleData: MichelsonMap<string, any> = await storage.oracleData;

      const p = await oracleData.get(pair);

      return p['2'] as BigNumber;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
