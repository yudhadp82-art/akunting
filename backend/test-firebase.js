require('dotenv').config();
const { Member } = require('./src/models');

async function testFirebase() {
  try {
    console.log('Testing Firebase connection...');
    console.log('Config:', {
      projectId: process.env.FIREBASE_PROJECT_ID,
      apiKey: process.env.FIREBASE_API_KEY ? 'EXISTS' : 'MISSING',
      adminKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'EXISTS' : 'MISSING'
    });

    console.log('Creating a test member...');
    const member = await Member.create({
      name: 'Test Member ' + new Date().getTime(),
      status: 'ACTIVE',
      phone: '08123456789'
    });

    console.log('Member created successfully:', member);

    console.log('Fetching members...');
    const members = await Member.findAll({ limit: 5 });
    console.log('Found members:', members.length);
    members.forEach(m => console.log(`- ${m.id}: ${m.name}`));

    process.exit(0);
  } catch (error) {
    console.error('Firebase Test Failed:', error);
    process.exit(1);
  }
}

testFirebase();
