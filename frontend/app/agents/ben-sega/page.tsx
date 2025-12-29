'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('ben-sega')!;

export default function BenSegaPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
