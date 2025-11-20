// Test page to verify ChatBox component rendering
'use client'

import ChatBox from '../../components/ChatBox'

export default function TestChatPage() {
  const handleSendMessage = async (message: string) => {
    console.log('Test message:', message)
    return 'Test response: ' + message
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ChatBox Component Test</h1>
      <div className="h-96">
        <ChatBox
          agentId="test-agent"
          sessionId="test-session"
          agentName="Test Agent"
          agentColor="from-blue-500 to-purple-600"
          placeholder="Type a test message..."
          initialMessages={[]}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  )
}