'use client';

import UniversalAgentChat from '../../../components/UniversalAgentChat';
import { getAgentConfig } from '../agentChatConfigs';

const agentConfig = getAgentConfig('pdf-demo')!;

export default function PdfDemoPage() {
  return <UniversalAgentChat agent={agentConfig} />;
}
