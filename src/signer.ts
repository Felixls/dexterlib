import { InMemorySigner } from '@taquito/signer';

export class Signer {
  static async get(secretKey: string) {
    return await InMemorySigner.fromSecretKey(secretKey);
  }
}
