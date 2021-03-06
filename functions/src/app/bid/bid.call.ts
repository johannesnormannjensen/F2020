import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import { Bid, currentSeason, getBookie, getCurrentRace, internalError, logAndCreateError, PlayerImpl, validateAccess } from "../../lib";
import { racesURL, seasonsURL } from '../../lib/collection-names';
import { validateBid } from '../../lib/validate.service';
import { transferInTransaction } from './../../lib/transactions.service';


const validateBalance = (player: PlayerImpl): void => {
  if ((player.balance || 0) - 20 < -100) {
    throw logAndCreateError('failed-precondition', `${player.displayName} has insufficient funds. Balance: ${(player.balance || 0).toFixed(2)}`)
  }

}

export const submitBid = functions.region('europe-west1').https.onCall(async(data, context) => {
  return validateAccess(context.auth?.uid, 'player')
    .then(player => buildBid(player))
    .then(() => true)
    .catch(internalError);
});

const buildBid = async (player: PlayerImpl) => {
  const season = await currentSeason();
  const race = await getCurrentRace();
  const bookie = await getBookie();

  if (!season || !race) {
    throw logAndCreateError('failed-precondition', 'Missing season or race', season, race);
  }

  const db = admin.firestore();
  const doc = db.doc(`${seasonsURL}/${season.id}/${racesURL}/${race.location.country}/bids/${player.uid}`) as admin.firestore.DocumentReference<Bid>;
  const bid = (await doc.get()).data();
  
  if (!bid) {
    throw logAndCreateError('not-found', `No bid exists for uid: ${player.uid} for race ${race.location.country}`);
  }

  validateBid(bid,race);
  validateBalance(player);

  return db.runTransaction(transaction => {
    transaction.update(doc, {submitted: true});
    transferInTransaction({
      date: DateTime.local(),
      amount: 20,
      message: `Deltagelse ${race.name}`,
      from: player.uid,
      to: bookie.uid,
    }, transaction);
    return Promise.resolve('Bid submitted');
  })

}
