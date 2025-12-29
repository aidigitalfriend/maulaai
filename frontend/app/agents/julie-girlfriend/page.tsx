'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('julie-girlfriend')!;

export default function JulieGirlfriendPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
