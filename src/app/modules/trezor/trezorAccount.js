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
     * @returns {{data: any, signature: string}}
     */
    signTransaction(transaction) {
        transaction.signer = PublicAccount.createWithPublicKey("462ee976890916e54fa825d26bdd0235f5eb5b6a143c199ab0ae5ee9328e08ce");
        transaction.setNetworkType(NEMLibrary.getNetworkType());
        return Observable.fromPromise(this._Trezor.serialize(transaction.toDTO(), { hdKeypath: this.hdKeyPath }));
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
            const serialized = await this._Trezor.serialize(dtos[i], { hdKeypath: this.hdKeyPath }, keepSession);
            signedTransactions.push(serialized);
        }
        return signedTransactions;
    }

    signSerialTransactions(transactions) {
        return Observable.fromPromise(this.signSerialTransactionsPromise(transactions));
    }
}
