const { getKeyPairFromPrivateKey, verifyUnspentTxOut } = require("../utils/commonUtils");
const TxIn = require('../transaction/TxIn');
const TxOut = require('../transaction/TxOut');
const Transaction = require('../transaction/index');

class Wallet {
    constructor(privateKey) {
        this.keyPair = getKeyPairFromPrivateKey(privateKey);
        this.address = this.keyPair.getPublic().encode("hex", false);
    }

    getAddress = () => {
        return this.address;
    }

    getBalance = (unspentTxOuts) => {
        let balance = 0;

        unspentTxOuts.forEach((unspentTxOut) => {
            if (unspentTxOut.address === this.address && !unspentTxOut.inPool) {
                balance += unspentTxOut.amount;
            }
        });

        return balance;
    }

    findTxOutsForAmount = (amount, unspentTxOuts) => {
        let includedTxOuts = [];
        let remainAmount = 0;
        let curAmount = 0;

        for (const [key, unspentTxOut] of unspentTxOuts) {
            if (this.address === unspentTxOut.address && !unspentTxOut.inPool) {
                curAmount += unspentTxOut.amount;
                includedTxOuts.push(unspentTxOut);

                if (curAmount >= amount) {
                    remainAmount = curAmount - amount;
                    return {includedTxOuts, remainAmount};
                }
            }
        }
        return {includedTxOuts: null, remainAmount: null};
    }

    createTransaction = (receiptAddress, amount, unspentTxOuts) => {
        const { includedTxOuts, remainAmount } = this.findTxOutsForAmount(amount, unspentTxOuts);

        if (includedTxOuts !== null && remainAmount !== null) {
            const txOut = new TxOut(receiptAddress, amount);
            const txRemain = null;
            if (remainAmount > 0) {
                txRemain = new TxOut(this.address, remainAmount);
            }
            const txIns = includedTxOuts.map((unspentTxOut) => {
                const txIn = new TxIn(unspentTxOut.txOutId, unspentTxOut.txOutIndex, null);
                return txIn;
            });

            const transaction = new Transaction(this.address, txIns, [txOut, txRemain]);

            return transaction;
        } else {
            throw new Error('You are not enough money to send.');
        }
    }

    signTransaction = (transaction, unspentTxOuts) => {
        if (transaction.senderAddress != this.address) {
            throw new Error('Transaction address is not match.');
        }

        transaction.txIns.forEach((txIn) => {
            if (!verifyUnspentTxOut(txIn.txOutId, this.address, unspentTxOuts)) {
                throw new Error('Transaction address is not match.');
            }

            txIn.signature = this.keyPair.sign(transaction.hashData());
        })
    }
}

module.exports = Wallet;