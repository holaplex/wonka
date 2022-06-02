import * as admin from 'firebase-admin';
import serviceAccount from '../../..//firebaseAdminConfig.json';

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
