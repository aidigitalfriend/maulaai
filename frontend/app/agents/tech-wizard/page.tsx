'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('tech-wizard')!;

export default function TechWizardPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
