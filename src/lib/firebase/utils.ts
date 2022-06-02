import { firebaseAdmin } from './admin';

export const validateFirebaseToken = async (idToken: string) => {
  const result = await firebaseAdmin.auth().verifyIdToken(idToken, true);
  console.log(`Authentication valid for: ${result.uid}`);
  return result;
};
