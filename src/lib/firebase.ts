/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let app;
let db: any = null;
let auth: any = null;
let isFirebaseEnabled = false;

try {
  // Check if firebase client config has been populated with real values
  const hasRealConfig = firebaseConfig && 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('mock-') && 
    firebaseConfig.projectId && 
    !firebaseConfig.projectId.includes('mock-');

  if (hasRealConfig) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    // Set Firestore database ID from config if specified
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId === "(default)" ? undefined : firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully for Sunita International School backend.');
  } else {
    console.warn('Firebase configuration is inactive. Defaulting to Local Storage cached database.');
  }
} catch (error) {
  console.error('Failed to initialize Firebase SDK:', error);
}

export { db, auth, isFirebaseEnabled, GoogleAuthProvider, signInWithPopup, signOut };

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Hardened Error Raised:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
