import { environment } from './../../environments/environment';
import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';

// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

@NgModule({
  imports: [CommonModule]
})
export class FirebaseModule {

  constructor() {
    console.log('Firebase initialized', environment.firebaseConfig);
    firebase.initializeApp(environment.firebaseConfig);
  }
}
