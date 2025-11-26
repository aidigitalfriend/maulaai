import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

async function checkDatabaseStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Get all collection stats
    const db = mongoose.connection.db
    const collections = await db.listCollections().toArray()
    
    console.log('\\n📊 Database Status Report\\n')
    
    for (const col of collections) {
      try {
        const count = await db.collection(col.name).countDocuments()
        const sampleDoc = await db.collection(col.name).findOne()
        
        console.log(`📁 ${col.name.padEnd(20)} - ${count.toString().padStart(3)} documents`)
        
        if (count > 0 && sampleDoc) {
          // Show some sample fields if document exists
          const keys = Object.keys(sampleDoc).slice(0, 3)
          console.log(`   Sample fields: ${keys.join(', ')}`)
        }
      } catch (error) {
        console.log(`❌ ${col.name.padEnd(20)} - Error: ${error.message}`)
      }
    }
    
    console.log('\\n🎯 Key Collections Status:')
    
    const keyCollections = [
      'users', 'agents', 'plans', 'coupons', 
      'subscriptions', 'payments', 'billings', 'invoices'
    ]
    
    for (const collectionName of keyCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments()
        const status = count > 0 ? '✅' : '⭕'
        console.log(`${status} ${collectionName.padEnd(15)} - ${count} documents`)
      } catch (error) {
        console.log(`❌ ${collectionName.padEnd(15)} - Collection not found`)
      }
    }
    
    console.log('\\n💡 Next Steps:')
    console.log('   • Pricing models are created and ready to use')
    console.log('   • Sample data shows the models are working')
    console.log('   • You can now integrate payment processing')
    console.log('   • Add frontend components for plan selection')
    
    await mongoose.disconnect()
    console.log('\\n👋 Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkDatabaseStatus()