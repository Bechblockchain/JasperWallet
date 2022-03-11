import nem from 'nem-sdk';
import TrezorConnect from 'trezor-connect';

/** Service storing Trezor utility functions. */
class Trezor {

    /**
     * Initialize dependencies and properties
     *
     * @params {services} - Angular services to inject
     */
    constructor() {
        'ngInject';

        // Service dependencies region //

        // End dependencies region //

        // Service properties region //

        // End properties region //
        TrezorConnect.manifest({ email: 'dev@symbol.dev', appUrl: 'https://symbol.dev' });
    }

    // Service methods region //

    createWallet(network) {
        return this.createAccount(network, 0, "Primary").then((account) => ({
            "name": "TREZOR",
            "accounts": {
                "0": account
            }
        }));
    }

    bip44(network, index) {
        const coinType = network == -104 ? 1 : 43;

        return `m/44'/${coinType}'/${index}'/0'/0'`;
    }

    createAccount(network, index, label) {
        return new Promise((resolve, reject) => {
            const hdKeypath = this.bip44(network, index);
            TrezorConnect.nemGetAddress({
                path: hdKeypath,
                network: network < 0 ? 256 + network : network,
                showOnTrezor: true
            }).then(function(result) {
                if (result.success) {
                    resolve({
                        "brain": false,
                        "algo": "trezor",
                        "encrypted": "",
                        "iv": "",
                        "address": result.payload.address,
                        "label": label,
                        "network": network,
                        "child": "",
                        "hdKeypath": hdKeypath
                    });
                } else {
                    reject(result.error);
                }
            })
        });
    }

    deriveRemote(account, network) {
        const key = "Export delegated harvesting key?";
        const value = "0000000000000000000000000000000000000000000000000000000000000000";

        return new Promise((resolve, reject) => {
            TrezorConnect.cipherKeyValue({
                path: account.hdKeypath,
                key: key,
                value: value,
                encrypt: true,
                askOnEncrypt: true,
                askOnDecrypt: true
            }).then(function(result) {
                if (result.success) {
                    const privateKey = nem.utils.helpers.fixPrivateKey(result.payload.value);
                    const keyPair = nem.crypto.keyPair.create(privateKey);
                    const publicKey = keyPair.publicKey.toString();
                    const address = nem.model.address.toAddress(publicKey, network);

                    resolve({
                        address,
                        privateKey,
                        publicKey
                    });
                } else {
                    reject(result.error);
                }
            })
        });
    }

    serialize(transaction, account) {
        return new Promise((resolve, reject) => {
            TrezorConnect.nemSignTransaction({
                path: account.hdKeypath,
                transaction: transaction
            }).then(function(result) {
                if (result.success) {
                    resolve(result.payload);
                } else {
                    reject({
                        "code": 0,
                        "data": {
                            "message": result.error
                        }
                    });
                }
            })

        });
    }

    showAccount(account) {
        return new Promise((resolve, reject) => {
            TrezorConnect.nemGetAddress({
                path: account.hdKeypath,
                network: account.network < 0 ? 256 + account.network : account.network,
                showOnTrezor: true
            }).then(function(result) {
                if (result.success) {
                    resolve(result.payload.address);
                } else {
                    reject(result.error);
                }
            })
        });
    }

    // End methods region //

}

export default Trezor;
