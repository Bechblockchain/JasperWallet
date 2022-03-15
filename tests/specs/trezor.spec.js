import { fail } from 'assert';
import { TrezorAccount } from '../../src/app/modules/trezor/trezorAccount';

describe('Trezor integration', function () {
    const transaction = {
        type: 257,
        version: -1744830463,
        timeStamp: 130922553,
        deadline: 130926153,
        recipient: 'TA545ICAVNEUDFUBIHO3CEJBSVIZ7YYHFFX5LQPT',
        amount: 1000000,
        fee: 100000,
        message: {
            type: 1,
            payload: '616263',
        },
        mosaics: null,
        setNetworkType: function (network) {
            this.network = network;
        },
        toDTO: function () {},
    };
    const address = 'TA545ICAVNEUDFUBIHO3CEJBSVIZ7YYHFFX5LQPT';
    const hdKeyPath = "44'/43'/152'/0'/0'";
    const network = -104;
    const Trezor = {
        serialize: () => {},
    };

    it('Can serialize single transaction for trezor account', async function (done) {
        // Arrange
        const trezorAccount = new TrezorAccount(address, hdKeyPath, network, Trezor);
        let expectedResult = 'payload';
        spyOn(Trezor, 'serialize').and.returnValue(Promise.resolve(expectedResult));

        let result;

        // Act
        try {
            result = await trezorAccount.signTransaction(transaction).toPromise();
        } catch (err) {
            fail('Error while serializing single transaction for trezor: ' + err);
        }

        // Assert
        expect(Trezor.serialize).toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
        done();
    });

    it('Can serialize multiple transactions for trezor account', async function (done) {
        // Arrange
        const trezorAccount = new TrezorAccount(address, hdKeyPath, network, Trezor);
        let expectedResults = ['payload 1', 'payload 2'];
        spyOn(Trezor, 'serialize').and.returnValues(...expectedResults.map((r) => Promise.resolve(r)));

        let result;

        // Act
        try {
            result = await trezorAccount.signTransactions([transaction, transaction]).first().toPromise();
        } catch (err) {
            fail('Error while serializing multiple transactions for trezor: ' + err);
        }

        // Assert
        expect(Trezor.serialize).toHaveBeenCalled();
        expect(result).toEqual(expectedResults);
        done();
    });
});
