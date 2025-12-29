'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('professor-astrology')!;

export default function ProfessorAstrologyPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
