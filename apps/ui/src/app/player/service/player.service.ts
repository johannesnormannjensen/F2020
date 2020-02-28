import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { Player } from '@f2020/data';
import { AngularFirestore } from '@angular/fire/firestore';
import { first, switchMap } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {

  constructor(private afs: AngularFirestore) {
    firebase.auth().getRedirectResult().then(result => {
      if (result && result.user) {
        this.updateBaseInformation(result.user).toPromise().then(() => console.log('Base information updated'));
      }
    });
    firebase.auth().onAuthStateChanged(user => {
      this._player$.next({ ...user });
      console.log(user);
    });
  }

  private _player$ = new ReplaySubject<firebase.UserInfo | null>(1);

  get player$(): Observable<firebase.UserInfo> {
    return this._player$.asObservable();
  }

  signInWithGoogle(): Promise<void> {
    return firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()).then(_ => console.log('Signed in using google'));
  }

  signOut(): Promise<void> {
    return firebase.auth().signOut();
  }

  private updateBaseInformation(player: Player): Observable<void> {
    const _player: Player = {
      uid: player.uid,
      displayName: player.displayName,
      email: player.email,
      photoURL: player.photoURL,
    };
    const doc = this.afs.collection('player').doc(player.uid);
    return doc.get().pipe(
      switchMap(snapshot => snapshot.exists ? doc.update(_player) : doc.set(_player)),
      first(),
    );
  }
}
