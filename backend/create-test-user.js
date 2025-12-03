import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('onelastai');
    const users = db.collection('users');
    
    const count = await users.countDocuments();
    console.log(`📊 Total users in database: ${count}`);
    
    // Check for test user
    const testUser = await users.findOne({ email: 'test@onelastai.co' });
    
    if (!testUser) {
      console.log('🔐 Creating test user...');
      const hashedPassword = await bcrypt.hash('test123', 12);
      
      const result = await users.insertOne({
        email: 'test@onelastai.co',
        password: hashedPassword,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        verified: true,
        bio: 'Test user account',
        timezone: 'UTC',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          productUpdates: true
        },
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: ''
        }
      });
      
      console.log('✅ Test user created successfully!');
      console.log('📧 Email: test@onelastai.co');
      console.log('🔑 Password: test123');
      console.log('🆔 ID:', result.insertedId);
    } else {
      console.log('✅ Test user already exists');
      console.log('📧 Email:', testUser.email);
      console.log('👤 Name:', testUser.name);
      console.log('🆔 ID:', testUser._id);
    }
    
    // List all users
    console.log('\n📋 All users:');
    const allUsers = await users.find({}, { projection: { email: 1, name: 1, createdAt: 1 } }).toArray();
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.name}) - Created: ${u.createdAt?.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestUser();
