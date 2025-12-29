'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('bishop-burger')!;

export default function BishopBurgerPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
