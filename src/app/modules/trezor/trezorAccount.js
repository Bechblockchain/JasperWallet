import * as nemSdk from "nem-sdk";
import { Observable } from "rxjs";
import { PublicAccount, NEMLibrary } from "nem-library";

/**
 * TrezorAccount model
 */
export class TrezorAccount {
 
    /**
     * Constructor
     * @param address
     */
    constructor(address, hdKeyPath, Trezor) {
        this.address = address;
        this.hdKeyPath = hdKeyPath;
        this._Trezor = Trezor;
    }

    /**
     * Sign a transaction
     * @param transaction
     * @param receiverPublicKey (optional): if given, the message will be encrypted
     * @returns {{data: any, signature: string}}
     */
    signTransaction(transaction, receiverPublicKey) {
        transaction.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
        transaction.setNetworkType(NEMLibrary.getNetworkType());
        const dto = transaction.toDTO();
        if (receiverPublicKey !== undefined) {
            dto.message.type = 2;
            dto.message.publicKey = receiverPublicKey;

            const encPayload =
            nemSdk.default.crypto.helpers.encode(receiverPublicKey, receiverPublicKey, dto.message.payload);

            let min = Math.floor(Math.max(1, (dto.amount / 1000000) / 10000));
            min = min > 25 ? 25 : min;
            let fee = Math.floor(0.05 * min * 1000000);
            if (dto.message.payload && encPayload.length != 0) {
                fee += 0.05 * (Math.floor((encPayload.length / 2) / 32) + 1) * 1000000;
            }
            dto.fee = fee;
        }
        return Observable.fromPromise(this._Trezor.serialize(dto, this));
    }

    async signSerialTransactionsPromise(transactions) {
        const dtos = transactions.map(t => {
            t.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
            t.setNetworkType(NEMLibrary.getNetworkType());
            return t.toDTO();
        });
        const signedTransactions = [];
        for (let i = 0; i < transactions.length; i++) {
            const keepSession = (i < transactions.length - 1);
            const serialized = await this._Trezor.serialize(dtos[i], this.hdKeyPath, keepSession);
            signedTransactions.push(serialized);
        }
        return signedTransactions;
    }

    signSerialTransactions(transactions) {
        return Observable.fromPromise(this.signSerialTransactionsPromise(transactions));
    }
}
