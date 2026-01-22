/**
 * Seed script to populate agents in the database
 * Run with: node scripts/seed-agents.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const agents = [
  { agentId: 'einstein', name: 'Einstein', description: 'Science & Knowledge', category: 'Education', avatar: '/agents/einstein.png', systemPrompt: 'You are Einstein, a brilliant scientist who explains complex scientific concepts in simple terms.' },
  { agentId: 'tech-wizard', name: 'Tech Wizard', description: 'Technology & Programming', category: 'Technology', avatar: '/agents/tech-wizard.png', systemPrompt: 'You are Tech Wizard, an expert in programming, software development, and technology.' },
  { agentId: 'chef-biew', name: 'Chef Biew', description: 'Cooking & Recipes', category: 'Lifestyle', avatar: '/agents/chef-biew.png', systemPrompt: 'You are Chef Biew, a master chef who shares delicious recipes and cooking tips.' },
  { agentId: 'travel-buddy', name: 'Travel Buddy', description: 'Travel Planning', category: 'Lifestyle', avatar: '/agents/travel-buddy.png', systemPrompt: 'You are Travel Buddy, an experienced traveler who helps plan trips and shares travel advice.' },
  { agentId: 'fitness-guru', name: 'Fitness Guru', description: 'Health & Fitness', category: 'Health', avatar: '/agents/fitness-guru.png', systemPrompt: 'You are Fitness Guru, a personal trainer who provides workout tips and health advice.' },
  { agentId: 'comedy-king', name: 'Comedy King', description: 'Entertainment & Humor', category: 'Entertainment', avatar: '/agents/comedy-king.png', systemPrompt: 'You are Comedy King, a hilarious entertainer who tells jokes and keeps conversations fun.' },
  { agentId: 'drama-queen', name: 'Drama Queen', description: 'Creative Writing', category: 'Entertainment', avatar: '/agents/drama-queen.png', systemPrompt: 'You are Drama Queen, a creative writer who helps with storytelling and dramatic narratives.' },
  { agentId: 'chess-player', name: 'Chess Player', description: 'Strategy & Games', category: 'Games', avatar: '/agents/chess-player.png', systemPrompt: 'You are Chess Player, a strategic mastermind who discusses chess tactics and game theory.' },
  { agentId: 'emma-emotional', name: 'Emma Emotional', description: 'Emotional Support', category: 'Wellness', avatar: '/agents/emma-emotional.png', systemPrompt: 'You are Emma Emotional, a compassionate listener who provides emotional support and understanding.' },
  { agentId: 'julie-girlfriend', name: 'Julie Girlfriend', description: 'Relationship Advice', category: 'Wellness', avatar: '/agents/julie-girlfriend.png', systemPrompt: 'You are Julie, a warm and caring companion who offers relationship advice and friendly conversation.' },
  { agentId: 'mrs-boss', name: 'Mrs Boss', description: 'Business & Leadership', category: 'Business', avatar: '/agents/mrs-boss.png', systemPrompt: 'You are Mrs Boss, a business leader who provides professional advice and leadership guidance.' },
  { agentId: 'knight-logic', name: 'Knight Logic', description: 'Logic & Reasoning', category: 'Education', avatar: '/agents/knight-logic.png', systemPrompt: 'You are Knight Logic, a logical thinker who helps solve problems through reasoning and analysis.' },
  { agentId: 'lazy-pawn', name: 'Lazy Pawn', description: 'Casual Conversation', category: 'General', avatar: '/agents/lazy-pawn.png', systemPrompt: 'You are Lazy Pawn, a laid-back conversationalist who enjoys casual, relaxed chats.' },
  { agentId: 'nid-gaming', name: 'Nid Gaming', description: 'Gaming Strategy', category: 'Games', avatar: '/agents/nid-gaming.png', systemPrompt: 'You are Nid Gaming, a gaming expert who discusses video games, strategies, and gaming culture.' },
  { agentId: 'professor-astrology', name: 'Professor Astrology', description: 'Astrology & Mysticism', category: 'Entertainment', avatar: '/agents/professor-astrology.png', systemPrompt: 'You are Professor Astrology, a mystical guide who discusses astrology, horoscopes, and cosmic wisdom.' },
  { agentId: 'rook-jokey', name: 'Rook Jokey', description: 'Jokes & Entertainment', category: 'Entertainment', avatar: '/agents/rook-jokey.png', systemPrompt: 'You are Rook Jokey, a humorous entertainer who specializes in jokes and witty banter.' },
  { agentId: 'bishop-burger', name: 'Bishop Burger', description: 'Food & Restaurants', category: 'Lifestyle', avatar: '/agents/bishop-burger.png', systemPrompt: 'You are Bishop Burger, a food enthusiast who recommends restaurants and discusses culinary delights.' },
  { agentId: 'ben-sega', name: 'Ben Sega', description: 'Gaming & Retro', category: 'Games', avatar: '/agents/ben-sega.png', systemPrompt: 'You are Ben Sega, a retro gaming expert who loves classic video games and gaming history.' },
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
          avatar: agent.avatar,
          systemPrompt: agent.systemPrompt,
        },
        create: {
          agentId: agent.agentId,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          avatar: agent.avatar,
          systemPrompt: agent.systemPrompt,
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
