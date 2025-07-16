const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account key
const serviceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'carer-match'
});

const db = admin.firestore();

async function setupDatabase() {
  console.log('🔥 Setting up Firestore database...\n');
  
  try {
    // 1. Create admin user profile
    const userUID = 'qW2qFpHjKOhAThdSWmpv8I1xJ7j1';
    const email = 'traderaz@hotmail.com';
    
    console.log('👤 Creating admin user profile...');
    const userData = {
      email: email,
      name: 'System Administrator',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };
    
    await db.collection('users').doc(userUID).set(userData);
    console.log('✅ Admin user created successfully');
    
    // 2. Create sample carer profiles
    console.log('👥 Creating sample carer profiles...');
    
    const carers = [
      {
        name: 'John and Jane Smith',
        email: 'smith@example.com',
        phone: '+44 1234 567890',
        address: {
          street: '123 Main Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          region: 'London'
        },
        preferences: {
          ageRange: { min: 5, max: 16 },
          acceptsSiblings: true,
          allowsPets: false,
          genderPreference: null,
          placementTypes: ['short-term', 'long-term'],
          preferredLocations: ['London', 'Surrey'],
          excludedLocations: ['Scotland']
        },
        experience: {
          yearsOfExperience: 5,
          experienceWithBehaviouralNeeds: true,
          experienceWithSEN: false,
          experienceWithDisabilities: ['autism', 'adhd'],
          previousPlacements: 12,
          specializations: ['teenagers', 'sibling-groups']
        },
        availability: {
          status: 'active',
          currentCapacity: 2,
          maxCapacity: 2,
          availableFrom: new Date(),
          temporaryUnavailable: false
        },
        safeguarding: {
          dbsCheck: {
            status: 'valid',
            expiryDate: new Date(2024, 11, 31),
            certificateNumber: 'DBS123456789'
          },
          training: {
            safeguardingLevel: 'level-2',
            lastTrainingDate: new Date(),
            nextTrainingDue: new Date(2025, 0, 1)
          }
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userUID,
        updatedBy: userUID
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+44 1234 567891',
        address: {
          street: '456 Oak Avenue',
          city: 'Manchester',
          postcode: 'M1 2AB',
          region: 'Manchester'
        },
        preferences: {
          ageRange: { min: 8, max: 18 },
          acceptsSiblings: false,
          allowsPets: true,
          genderPreference: 'female',
          placementTypes: ['long-term', 'emergency'],
          preferredLocations: ['Manchester', 'Liverpool'],
          excludedLocations: ['London']
        },
        experience: {
          yearsOfExperience: 8,
          experienceWithBehaviouralNeeds: false,
          experienceWithSEN: true,
          experienceWithDisabilities: ['dyslexia', 'autism'],
          previousPlacements: 6,
          specializations: ['SEN', 'teenagers']
        },
        availability: {
          status: 'active',
          currentCapacity: 1,
          maxCapacity: 1,
          availableFrom: new Date(),
          temporaryUnavailable: false
        },
        safeguarding: {
          dbsCheck: {
            status: 'valid',
            expiryDate: new Date(2024, 11, 31),
            certificateNumber: 'DBS987654321'
          },
          training: {
            safeguardingLevel: 'level-3',
            lastTrainingDate: new Date(),
            nextTrainingDue: new Date(2025, 0, 1)
          }
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userUID,
        updatedBy: userUID
      }
    ];
    
    for (const carer of carers) {
      await db.collection('carers').add(carer);
    }
    console.log('✅ Sample carers created successfully');
    
    // 3. Create sample referral
    console.log('📋 Creating sample referral...');
    const referralData = {
      childName: 'Child A',
      age: 12,
      gender: 'male',
      ethnicity: 'White British',
      culturalBackground: 'British',
      referringAgency: 'Local Authority',
      referralSource: 'socialworker@council.gov.uk',
      referralDate: new Date(),
      urgency: 'high',
      needs: {
        senNeeds: true,
        senDetails: 'Dyslexia support required',
        disabilities: ['dyslexia'],
        behaviouralNeeds: false,
        behaviouralDetails: '',
        medicalNeeds: ['regular medication'],
        educationalNeeds: ['SEN support', '1-to-1 teaching assistant'],
        therapeuticNeeds: ['counselling']
      },
      placement: {
        placementType: 'long-term',
        duration: '12+ months',
        soloPlacementRequired: false,
        siblingGroup: false,
        siblingCount: 0,
        petsAllowed: true,
        preferredLocations: ['London', 'Surrey'],
        excludedLocations: ['Scotland'],
        carerGenderPreference: null,
        specialRequirements: ['pet-friendly', 'experienced-with-SEN']
      },
      status: 'pending',
      extractedData: false,
      matchedCarers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userUID,
      updatedBy: userUID
    };
    
    await db.collection('referrals').add(referralData);
    console.log('✅ Sample referral created successfully');
    

    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Created:');
    console.log('├── 1 admin user (traderaz@hotmail.com)');
    console.log('├── 2 sample carers');
    console.log('└── 1 sample referral');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

// Run the setup
setupDatabase().then(() => {
  console.log('\n✅ Setup completed.');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
}); 