'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('enhanced-demo')!;

export default function EnhancedChatDemoPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
