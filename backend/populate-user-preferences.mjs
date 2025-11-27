import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

function createDefaultPreferences(userId) {
    const now = new Date();
    return {
        userId: userId.toString(),
        general: {
            theme: 'system',
            language: 'en',
            timezone: 'UTC'
        },
        interface: {
            density: 'comfortable',
            animations: true
        },
        privacy: {
            profileVisibility: 'private',
            shareAnalytics: false
        },
        communications: {
            emailNotifications: {
                enabled: true,
                frequency: 'immediate',
                types: {
                    system: true,
                    security: true,
                    updates: true,
                    marketing: false
                }
            }
        },
        ai: {
            defaultModel: 'gpt-3.5-turbo',
            temperature: 0.7
        },
        createdAt: now,
        updatedAt: now,
        source: 'population-script'
    };
}

async function populateUserPreferences() {
    let createdCount = 0;
    let skippedCount = 0;
    
    try {
        console.log('🚀 User Preferences Population Starting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        const preferencesCollection = db.collection('userpreferences');
        
        const users = await usersCollection.find({}).toArray();
        console.log(`📊 Found ${users.length} users`);
        
        const existingPrefs = await preferencesCollection.find({}).toArray();
        const existingUserIds = new Set(existingPrefs.map(pref => pref.userId));
        console.log(`📊 Found ${existingPrefs.length} existing preferences`);
        
        for (const user of users) {
            const userId = user._id.toString();
            console.log(`👤 Processing: ${user.email}`);
            
            if (existingUserIds.has(userId)) {
                console.log('   ⏭️  Skipping - already exists');
                skippedCount++;
                continue;
            }
            
            const defaultPrefs = createDefaultPreferences(user._id);
            await preferencesCollection.insertOne(defaultPrefs);
            console.log('   ✅ Created preferences');
            createdCount++;
        }
        
        console.log('\n📊 SUMMARY:');
        console.log(`✅ Created: ${createdCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log('🎉 Population completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

populateUserPreferences();
