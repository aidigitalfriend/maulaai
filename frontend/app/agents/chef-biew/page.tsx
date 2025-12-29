'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('chef-biew')!;

export default function ChefBiewPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
