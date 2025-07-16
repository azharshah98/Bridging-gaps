const http = require('http');

async function testBackend() {
  console.log('🔥 Testing Backend Functions...\n');
  
  // Test health endpoint
  const healthOptions = {
    hostname: 'localhost',
    port: 5001,
    path: '/carer-match/us-central1/api/health',
    method: 'GET'
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(healthOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Health endpoint working');
          console.log('Response:', JSON.parse(data));
          resolve();
        } else {
          console.log(`❌ Health endpoint failed: ${res.statusCode}`);
          reject(new Error(`Status: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Connection failed:', err.message);
      console.log('\n🔧 Make sure Functions emulator is running:');
      console.log('cd functions && firebase emulators:start --only functions');
      reject(err);
    });
    
    req.end();
  });
}

// Test the backend
testBackend()
  .then(() => {
    console.log('\n🎯 Backend Status: ✅ WORKING');
    console.log('\n🚀 Next steps:');
    console.log('1. Frontend should be running on: http://localhost:3001');
    console.log('2. Login with: traderaz@hotmail.com');
    console.log('3. Backend API is ready at: http://localhost:5001/carer-match/us-central1/api');
    console.log('4. Test creating carers/referrals to verify Firestore connection');
  })
  .catch(() => {
    console.error('❌ Backend test failed');
    process.exit(1);
  }); 