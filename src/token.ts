import { TezosToolkit } from '@taquito/taquito';
import { BigNumber } from 'bignumber.js';
import { Signer } from './signer';

export class Token {
  protected tezos: TezosToolkit;
  protected poolContractAddress: string;
  protected contractAddress: string;
  decimals = 6;
  protected secretKey: string;

  constructor(
    address: string,
    poolAddress: string,
    toolkit: TezosToolkit,
    secretKey: string
  ) {
    this.poolContractAddress = poolAddress;
    this.contractAddress = address;
    this.tezos = toolkit;
    this.secretKey = secretKey;
  }

  async getXTZPool(): Promise<BigNumber> {
    try {
      const contract = await this.tezos.contract.at(this.poolContractAddress);
      const storage: any = await contract.storage();
      const xtzPool: BigNumber = storage.xtzPool;
      return xtzPool;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getTokenPool(): Promise<BigNumber> {
    try {
      const contract = await this.tezos.contract.at(this.poolContractAddress);
      const storage: any = await contract.storage();
      const tokenPool: BigNumber = storage.tokenPool;
      return tokenPool;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getBalance(address: string): Promise<BigNumber> {
    try {
      const contract = await this.tezos.contract.at(this.contractAddress);
      const contractStorage = await contract.storage();
      const ledger = await (contractStorage as any).ledger;
      if (ledger === undefined) {
        return new BigNumber(0);
      }
      const bigMapKey = await ledger.get(address);
      if (bigMapKey === undefined) {
        return new BigNumber(0);
      }
      return bigMapKey.balance;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async fromXTZ(
    to: string,
    minTokensBought: number,
    amount: number
  ): Promise<string> {
    try {
      this.tezos.setSignerProvider(await Signer.get(this.secretKey));
      const contract = await this.tezos.contract.at(this.poolContractAddress);

      let deadline = new Date();
      deadline.setMinutes(deadline.getMinutes() + 20);

      const op = await contract.methods
        .xtzToToken(to, minTokensBought, deadline)
        .send({ amount: amount });

      await op.confirmation();

      return op.hash;
    } catch (err) {
      if (err.errors) {
        err.errors.forEach((e: any) => {
          if (e.with) {
            console.log(JSON.stringify(e.with));
          }
        });
      }
      console.log(err);
      throw err;
    }
  }

  async toXTZ(
    to: string,
    minXTZBought: number,
    amount: number
  ): Promise<string> {
    try {
      this.tezos.setSignerProvider(await Signer.get(this.secretKey));
      const poolContract = await this.tezos.contract.at(
        this.poolContractAddress
      );
      const contract = await this.tezos.contract.at(this.contractAddress);

      let deadline = new Date();
      deadline.setMinutes(deadline.getMinutes() + 20);

      const tokensSold = amount * 10 ** this.decimals;

      const batch = this.tezos
        .batch()
        .withContractCall(
          contract.methods.approve(this.poolContractAddress, tokensSold)
        )
        .withContractCall(
          poolContract.methods.tokenToXtz(
            to,
            to,
            tokensSold,
            minXTZBought,
            deadline
          )
        );

      const op = await batch.send();

      await op.confirmation();

      return op.hash;
    } catch (err) {
      if (err.errors) {
        err.errors.forEach((e: any) => {
          if (e.with) {
            console.log(JSON.stringify(e.with));
          }
        });
      }
      console.log(err);
      throw err;
    }
  }
}

export class TzBTC extends Token {
  constructor(toolkit: TezosToolkit, secretKey: string) {
    super(
      'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
      'KT1DrJV8vhkdLEj76h1H9Q4irZDqAkMPo1Qf',
      toolkit,
      secretKey
    );
    this.decimals = 8;
  }
}

export class UsdTZ extends Token {
  constructor(toolkit: TezosToolkit, secretKey: string) {
    super(
      'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
      'KT1Puc9St8wdNoGtLiD2WXaHbWU7styaxYhD',
      toolkit,
      secretKey
    );
  }
}

export class XTZ extends Token {
  constructor(toolkit: TezosToolkit) {
    super('', '', toolkit, '');
  }

  async getBalance(address: string): Promise<BigNumber> {
    try {
      const balance = await this.tezos.rpc.getBalance(address);

      return balance;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async fromXTZ(
    to: string,
    minTokensBought: number,
    amount: number
  ): Promise<string> {
    return 'N/A';
  }

  async toXTZ(
    to: string,
    minXTZBought: number,
    amount: number
  ): Promise<string> {
    return 'N/A';
  }

  async getXTZPool(): Promise<BigNumber> {
    return new BigNumber(0);
  }

  async getTokenPool(): Promise<BigNumber> {
    return new BigNumber(0);
  }
}
