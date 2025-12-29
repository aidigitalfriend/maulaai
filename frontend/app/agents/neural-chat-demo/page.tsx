'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('neural-demo')!;

export default function NeuralChatDemoPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
