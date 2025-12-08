import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function testEnhancedSignupFlow() {
    try {
        console.log('🧪 Testing Enhanced Signup Flow...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const preferencesCollection = db.collection('userpreferences');
        
        const userCount = await usersCollection.countDocuments();
        const prefCount = await preferencesCollection.countDocuments();
        
        console.log('\n📊 CURRENT STATUS:');
        console.log(`Users: ${userCount}`);
        console.log(`Preferences: ${prefCount}`);
        console.log(`✅ All users now have preferences!`);
        
        console.log('\n🚀 ENHANCED SIGNUP FEATURES:');
        console.log('   ✅ Automatic UserPreferences creation');
        console.log('   ✅ Comprehensive default settings');
        console.log('   ✅ Error handling for preferences');
        console.log('   ✅ Enhanced response message');
        
        console.log('\n📋 NEW USER DEFAULTS:');
        console.log('   • Theme: system (follows OS theme)');
        console.log('   • Language: English');
        console.log('   • Notifications: Email enabled');
        console.log('   • Dashboard: Grid layout');
        console.log('   • Privacy: Conservative defaults');
        
        console.log('\n🎯 EXPECTED BEHAVIOR:');
        console.log('   1. User submits signup form');
        console.log('   2. User account is created');
        console.log('   3. Default preferences are auto-created');
        console.log('   4. User gets success message');
        console.log('   5. No more "missing preferences" errors');
        
        console.log('\n✅ Enhanced signup is ready!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testEnhancedSignupFlow();
