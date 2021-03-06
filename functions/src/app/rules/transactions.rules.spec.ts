import { permissionDenied } from '../../test-utils/firestore-test-utils';
import { assertSucceeds, assertFails } from '@firebase/testing';
import { adminApp, authedApp, clearFirestoreData } from '../../test-utils/firestore-test-utils';
import { collections } from '../../test-utils';
import { playersURL, transactionsURL } from '../../lib/collection-names';


describe('transactions rules', () => {

  let adminFirestore: firebase.firestore.Firestore;

  beforeEach(async () => {
    adminFirestore = adminApp();
    await adminFirestore.doc(`${playersURL}/${collections.players.player.uid}`).set({ ...collections.players.player });
    await adminFirestore.doc(`${playersURL}/${collections.players.admin.uid}`).set({ ...collections.players.admin });
    await adminFirestore.doc(`${playersURL}/${collections.players.bookie.uid}`).set({ ...collections.players.bookie });
    await adminFirestore.doc(`${playersURL}/${collections.players.bankadmin.uid}`).set({ ...collections.players.bankadmin });
    await adminFirestore.doc(`${transactionsURL}/${collections.transactions.ts1}`).set({...collections.transactions.ts1});
    await adminFirestore.doc(`${transactionsURL}/${collections.transactions.ts2}`).set({...collections.transactions.ts2});
    await adminFirestore.doc(`${transactionsURL}/${collections.transactions.ts3}`).set({...collections.transactions.ts3});
    await adminFirestore.doc(`${transactionsURL}/${collections.transactions.ts4}`).set({...collections.transactions.ts4});
  
  });

  afterEach(async () => {
    await clearFirestoreData();
  });

  it('admin access to transactions checks', async () => {
    const app = await authedApp({ uid: collections.players.admin.uid });
    await assertSucceeds(app.firestore.doc(`${transactionsURL}/${collections.transactions.ts1}`).get())
    await assertFails(app.firestore.doc(`${transactionsURL}/${collections.transactions.ts1}`).update({ amount: 9999 })).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/ts200`).set({amount: '100', date: '21 March 2019 at 16:46:11 UTC+1', from: 'bookie-uid', to: 'player',   involved: [ 'bankadmin-uid', 'bookie-uid' ], message: 'test'})).then(permissionDenied)
  });

  it('player access to transactions checks', async () => {
    const app = await authedApp({ uid: collections.players.player.uid });
    await assertSucceeds(app.firestore.collection(`${transactionsURL}`).where('to', '==', 'player-uid').get())
    await assertSucceeds(app.firestore.collection(`${transactionsURL}`).where('from', '==', 'player-uid').get())
    await assertFails(app.firestore.collection(`${transactionsURL}`).where('to', '==', 'bankadmin-uid').get()).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/${collections.transactions.ts1}`).update({ amount: 9999 })).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/ts200`).set({amount: '100', date: '21 March 2019 at 16:46:11 UTC+1', from: 'bookie-uid', to: 'player',   involved: [ 'bankadmin-uid', 'bookie-uid' ], message: 'test'})).then(permissionDenied)
   });

  it('bookie access to transactions checks', async () => {
    const app = await authedApp({ uid: collections.players.bookie.uid });
    await assertSucceeds(app.firestore.collection(`${transactionsURL}`).where('to', '==', 'bookie-uid').get())
    await assertSucceeds(app.firestore.collection(`${transactionsURL}`).where('from', '==', 'bookie-uid').get())
    await assertFails(app.firestore.collection(`${transactionsURL}`).where('to', '==', 'bankadmin-uid').get()).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/${collections.transactions.ts1}`).update({ amount: 9999 })).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/ts200`).set({amount: '100', date: '21 March 2019 at 16:46:11 UTC+1', from: 'bookie-uid', to: 'player',   involved: [ 'bankadmin-uid', 'bookie-uid' ], message: 'test'})).then(permissionDenied)
  });

  it('bank admin access to transactions checks', async () => {
    const app = await authedApp({ uid: collections.players.bankadmin.uid });
    await assertSucceeds(app.firestore.collection(`${transactionsURL}`).where('to', '==', 'bankadmin-uid').get())
    await assertSucceeds(app.firestore.collection(`${transactionsURL}`).where('from', '==', 'bankadmin-uid').get())
    await assertFails(app.firestore.collection(`${transactionsURL}`).where('to', '==', 'bookie-uid').get()).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/${collections.transactions.ts1}`).update({ amount: 9999 })).then(permissionDenied)
    await assertFails(app.firestore.doc(`${transactionsURL}/ts200`).set({amount: '100', date: '21 March 2019 at 16:46:11 UTC+1', from: 'bookie-uid', to: 'player',   involved: [ 'bankadmin-uid', 'bookie-uid' ], message: 'test'})).then(permissionDenied)
  });

  it('non-player should not be allowed to read transaction', async () => {
    const app = await authedApp({ uid: 'non-player-id' });
    await assertFails(app.firestore.collection(`${transactionsURL}`).get()).then(permissionDenied)
  });
  
});
