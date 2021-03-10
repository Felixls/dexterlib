"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XTZ = exports.ETHtz = exports.UsdTZ = exports.TzBTC = exports.KUSD = exports.Token = exports.Network = void 0;
const bignumber_js_1 = require("bignumber.js");
const signer_1 = require("./signer");
var Network;
(function (Network) {
    Network["Mainnet"] = "mainnet";
    Network["Delphinet"] = "delphinet";
})(Network = exports.Network || (exports.Network = {}));
class Token {
    constructor(address, poolAddress, toolkit, secretKey, network) {
        this.decimals = 6;
        this.poolContractAddress = poolAddress;
        this.contractAddress = address;
        this.tezos = toolkit;
        this.secretKey = secretKey;
        this.network = network;
    }
    getXTZPool() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contract = yield this.tezos.contract.at(this.poolContractAddress);
                const storage = yield contract.storage();
                const xtzPool = storage.xtzPool;
                return xtzPool;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    getTokenPool() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contract = yield this.tezos.contract.at(this.poolContractAddress);
                const storage = yield contract.storage();
                const tokenPool = storage.tokenPool;
                return tokenPool;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    getBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contract = yield this.tezos.contract.at(this.contractAddress);
                const contractStorage = yield contract.storage();
                const ledger = yield contractStorage.ledger;
                if (ledger === undefined) {
                    return new bignumber_js_1.BigNumber(0);
                }
                const bigMapKey = yield ledger.get(address);
                if (bigMapKey === undefined) {
                    return new bignumber_js_1.BigNumber(0);
                }
                return bigMapKey.balance;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    fromXTZ(to, minTokensBought, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.tezos.setSignerProvider(yield signer_1.Signer.get(this.secretKey));
                const contract = yield this.tezos.contract.at(this.poolContractAddress);
                let deadline = new Date();
                deadline.setMinutes(deadline.getMinutes() + 20);
                const op = yield contract.methods
                    .xtzToToken(to, minTokensBought, deadline)
                    .send({ amount: amount });
                yield op.confirmation();
                return op.hash;
            }
            catch (err) {
                if (err.errors) {
                    err.errors.forEach((e) => {
                        if (e.with) {
                            console.log(JSON.stringify(e.with));
                        }
                    });
                }
                console.log(err);
                throw err;
            }
        });
    }
    toXTZ(to, minXTZBought, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.tezos.setSignerProvider(yield signer_1.Signer.get(this.secretKey));
                const poolContract = yield this.tezos.contract.at(this.poolContractAddress);
                const contract = yield this.tezos.contract.at(this.contractAddress);
                let deadline = new Date();
                deadline.setMinutes(deadline.getMinutes() + 20);
                const tokensSold = amount * Math.pow(10, this.decimals);
                const batch = this.tezos.contract
                    .batch()
                    .withContractCall(contract.methods.approve(this.poolContractAddress, tokensSold))
                    .withContractCall(poolContract.methods.tokenToXtz(to, to, tokensSold, minXTZBought, deadline));
                const op = yield batch.send();
                yield op.confirmation();
                return op.hash;
            }
            catch (err) {
                if (err.errors) {
                    err.errors.forEach((e) => {
                        if (e.with) {
                            console.log(JSON.stringify(e.with));
                        }
                    });
                }
                console.log(err);
                throw err;
            }
        });
    }
}
exports.Token = Token;
class KUSD extends Token {
    constructor(toolkit, secretKey, network) {
        let assetContract = '';
        let poolContract = '';
        switch (network) {
            case Network.Mainnet:
                assetContract = 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV';
                poolContract = 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6';
                break;
            case Network.Delphinet:
                assetContract = 'KT1RXpLtz22YgX24QQhxKVyKvtKZFaAVtTB9';
                poolContract = 'KT1XTUGj7Rkgh6vLVDu91h81Xu2WGfyTxpqi';
                break;
        }
        super(assetContract, poolContract, toolkit, secretKey, network);
        this.decimals = 18;
    }
}
exports.KUSD = KUSD;
class TzBTC extends Token {
    constructor(toolkit, secretKey, network) {
        let assetContract = '';
        let poolContract = '';
        switch (network) {
            case Network.Mainnet:
                assetContract = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';
                poolContract = 'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N';
                break;
            case Network.Delphinet:
                assetContract = 'KT1HeJBNHwWY18CuncPmMUVrSxurStXsMMvF';
                poolContract = 'KT1QGd6nEG2Dg2LcmkpveYQ98j5b2WgePtdo';
                break;
        }
        super(assetContract, poolContract, toolkit, secretKey, network);
        this.decimals = 8;
    }
}
exports.TzBTC = TzBTC;
class UsdTZ extends Token {
    constructor(toolkit, secretKey, network) {
        let assetContract = '';
        let poolContract = '';
        switch (network) {
            case Network.Mainnet:
                assetContract = 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9';
                poolContract = 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9';
                break;
            case Network.Delphinet:
                assetContract = 'KT1WvDfFgUKXWiBvQT46F8GpZ3rjQ6hLo7tz';
                poolContract = 'KT1Uw3c2EgxTEVN378PaaK68jNK4DqcEuLcy';
                break;
        }
        super(assetContract, poolContract, toolkit, secretKey, network);
    }
}
exports.UsdTZ = UsdTZ;
class ETHtz extends Token {
    constructor(toolkit, secretKey, network) {
        let assetContract = '';
        let poolContract = '';
        switch (network) {
            case Network.Mainnet:
                assetContract = 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8';
                poolContract = 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU';
                break;
            case Network.Delphinet:
                throw new Error('contract not available');
        }
        super(assetContract, poolContract, toolkit, secretKey, network);
        this.decimals = 18;
    }
}
exports.ETHtz = ETHtz;
class XTZ extends Token {
    constructor(toolkit, network) {
        super('', '', toolkit, '', network);
    }
    getBalance(address) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const balance = yield this.tezos.rpc.getBalance(address);
                return balance;
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    fromXTZ(to, minTokensBought, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return 'N/A';
        });
    }
    toXTZ(to, minXTZBought, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            return 'N/A';
        });
    }
    getXTZPool() {
        return __awaiter(this, void 0, void 0, function* () {
            return new bignumber_js_1.BigNumber(0);
        });
    }
    getTokenPool() {
        return __awaiter(this, void 0, void 0, function* () {
            return new bignumber_js_1.BigNumber(0);
        });
    }
}
exports.XTZ = XTZ;
//# sourceMappingURL=token.js.map