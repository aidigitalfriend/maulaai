/**
 * Seed script to populate agents in the database
 * Run with: node scripts/seed-agents.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const agents = [
  { agentId: 'einstein', name: 'Einstein', description: 'Science & Knowledge', category: 'Education', avatar: '/agents/einstein.png' },
  { agentId: 'tech-wizard', name: 'Tech Wizard', description: 'Technology & Programming', category: 'Technology', avatar: '/agents/tech-wizard.png' },
  { agentId: 'chef-biew', name: 'Chef Biew', description: 'Cooking & Recipes', category: 'Lifestyle', avatar: '/agents/chef-biew.png' },
  { agentId: 'travel-buddy', name: 'Travel Buddy', description: 'Travel Planning', category: 'Lifestyle', avatar: '/agents/travel-buddy.png' },
  { agentId: 'fitness-guru', name: 'Fitness Guru', description: 'Health & Fitness', category: 'Health', avatar: '/agents/fitness-guru.png' },
  { agentId: 'comedy-king', name: 'Comedy King', description: 'Entertainment & Humor', category: 'Entertainment', avatar: '/agents/comedy-king.png' },
  { agentId: 'drama-queen', name: 'Drama Queen', description: 'Creative Writing', category: 'Entertainment', avatar: '/agents/drama-queen.png' },
  { agentId: 'chess-player', name: 'Chess Player', description: 'Strategy & Games', category: 'Games', avatar: '/agents/chess-player.png' },
  { agentId: 'emma-emotional', name: 'Emma Emotional', description: 'Emotional Support', category: 'Wellness', avatar: '/agents/emma-emotional.png' },
  { agentId: 'julie-girlfriend', name: 'Julie Girlfriend', description: 'Relationship Advice', category: 'Wellness', avatar: '/agents/julie-girlfriend.png' },
  { agentId: 'mrs-boss', name: 'Mrs Boss', description: 'Business & Leadership', category: 'Business', avatar: '/agents/mrs-boss.png' },
  { agentId: 'knight-logic', name: 'Knight Logic', description: 'Logic & Reasoning', category: 'Education', avatar: '/agents/knight-logic.png' },
  { agentId: 'lazy-pawn', name: 'Lazy Pawn', description: 'Casual Conversation', category: 'General', avatar: '/agents/lazy-pawn.png' },
  { agentId: 'nid-gaming', name: 'Nid Gaming', description: 'Gaming Strategy', category: 'Games', avatar: '/agents/nid-gaming.png' },
  { agentId: 'professor-astrology', name: 'Professor Astrology', description: 'Astrology & Mysticism', category: 'Entertainment', avatar: '/agents/professor-astrology.png' },
  { agentId: 'rook-jokey', name: 'Rook Jokey', description: 'Jokes & Entertainment', category: 'Entertainment', avatar: '/agents/rook-jokey.png' },
  { agentId: 'bishop-burger', name: 'Bishop Burger', description: 'Food & Restaurants', category: 'Lifestyle', avatar: '/agents/bishop-burger.png' },
  { agentId: 'ben-sega', name: 'Ben Sega', description: 'Gaming & Retro', category: 'Games', avatar: '/agents/ben-sega.png' },
];

async function seedAgents() {
  console.log('🌱 Seeding agents to database...\n');

  for (const agent of agents) {
    try {
      const result = await prisma.agent.upsert({
        where: { agentId: agent.agentId },
        update: { 
          name: agent.name, 
          description: agent.description, 
          category: agent.category, 
          avatar: agent.avatar 
        },
        create: {
          agentId: agent.agentId,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          avatar: agent.avatar,
          status: 'active',
          pricing: { daily: 0.99, weekly: 4.99, monthly: 14.99 },
        },
      });
      console.log(`✅ ${agent.name} (${agent.agentId})`);
    } catch (e) {
      console.error(`❌ Error with ${agent.agentId}:`, e.message);
    }
  }

  console.log('\n🎉 Agent seeding complete!');
  
  // List all agents
  const allAgents = await prisma.agent.findMany({ select: { agentId: true, name: true } });
  console.log('\n📋 Agents in database:', allAgents.length);
  allAgents.forEach(a => console.log(`   - ${a.agentId}: ${a.name}`));
}

seedAgents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
