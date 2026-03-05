const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin using environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID || '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('Error initializing Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function addInvitedGroupsField() {
  try {
    console.log('Starting migration: Adding invitedGroups field to all users...');
    
    const usersCollection = await db.collection('users').get();
    
    if (usersCollection.empty) {
      console.log('No users found.');
      process.exit(0);
    }

    let updateCount = 0;
    const batch = db.batch();

    usersCollection.forEach((doc) => {
      const userData = doc.data();
      
      // Only update if invitedGroups doesn't exist
      if (!userData.invitedGroups) {
        console.log(`Updating user ${doc.id}: Adding invitedGroups field`);
        batch.update(doc.ref, {
          invitedGroups: [],
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✓ Successfully updated ${updateCount} user(s) with invitedGroups field`);
    } else {
      console.log('All users already have invitedGroups field.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

addInvitedGroupsField();
