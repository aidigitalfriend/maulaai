const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function checkCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Total collections: ${collections.length}`);
    console.log('📁 Collections list:');
    
    collections.sort((a, b) => a.name.localeCompare(b.name)).forEach((col, i) => {
      console.log(`  ${i+1}. ${col.name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkCollections();
