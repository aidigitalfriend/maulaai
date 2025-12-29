'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('multilingual-demo')!;

export default function MultilingualDemoPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
