import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function checkAgents() {
    try {
        console.log('🤖 Checking Available Agents...');
        await mongoose.connect(process.env.MONGODB_URI);
        
        const db = mongoose.connection.db;
        const agentsCollection = db.collection('agents');
        
        const agents = await agentsCollection.find({}).toArray();
        console.log(`📊 Found ${agents.length} agents`);
        
        console.log('\n🤖 AVAILABLE AGENTS:');
        agents.forEach((agent, i) => {
            console.log(`${i + 1}. ${agent.id} - ${agent.name}`);
            console.log(`   Type: ${agent.type || 'Not specified'}`);
            console.log(`   Description: ${agent.description?.substring(0, 60)}...`);
            console.log('');
        });
        
        console.log('🎯 GOOD CANDIDATES FOR AUTO-SUBSCRIPTION:');
        const coreAgents = ['einstein', 'tech-wizard', 'chef-biew', 'travel-buddy'];
        coreAgents.forEach(agentId => {
            const agent = agents.find(a => a.id === agentId);
            if (agent) {
                console.log(`✅ ${agent.name} (${agentId}) - Good for beginners`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkAgents();
