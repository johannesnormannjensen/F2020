import { logAndCreateError } from './../../lib/firestore-utils';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Player, playersURL, Transaction } from '../../lib';

const db = admin.firestore();

const playerURL = (uid: string) => `${playersURL}/${uid}`;

export const transactionTrigger = functions.region('europe-west1').firestore.document('transactions/{transactionId}')
  .onCreate(async (snapshot: functions.firestore.DocumentSnapshot) => {
    const transaction: Transaction | undefined = snapshot.data() as Transaction;
    const from = transaction.from ? db.doc(playerURL(transaction.from)) as admin.firestore.DocumentReference<Player> : null;
    const to = transaction.to ? db.doc(playerURL(transaction.to)) as admin.firestore.DocumentReference<Player> : null;

    return db.runTransaction(async firestoreTransaction => {
      if (from) {
        const ref = (await from.get())
        if (!ref.exists) {
          throw logAndCreateError('not-found', `From uid: ${transaction.from} was not found`);
        }
        const player = ref.data()!;
        console.log(`Withdrawing ${transaction.amount.toFixed(2)} from ${player.displayName}`);
        firestoreTransaction.update(from, {balance: (player.balance || 0) - transaction.amount});
      }
      if (to) {
        const ref = (await to.get())
        if (!ref.exists) {
          throw logAndCreateError('not-found', `To uid: ${transaction.to} was not found`);
        }
        const player = ref.data()!;
        console.log(`Depositing ${transaction.amount.toFixed(2)} to ${player.displayName}`);
        firestoreTransaction.update(to, {balance: (player.balance || 0) + transaction.amount});
      }
      return Promise.resolve(true);
    })
    .catch(error => logAndCreateError('internal', error));
  });
