'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('travel-buddy')!;

export default function TravelBuddyPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
