# 🤖 AI Live Support System - Implementation Plan

## 1. Current System Analysis

### 1.1 Existing Components ✅

| Component | Location | Status |
|-----------|----------|--------|
| **Frontend Chat UI** | `/frontend/app/support/live-support/page.tsx` | ✅ Complete (681 lines) |
| **SupportTicket Model** | `/backend/models/SupportTicket.js` | ✅ Complete (180 lines) |
| **User Model** | `/backend/models/User.js` | ✅ Complete |
| **AgentSubscription Model** | `/backend/models/AgentSubscription.js` | ✅ Complete |
| **Transaction Model** | `/backend/models/Transaction.js` | ✅ Complete |
| **FAQs Knowledge Base** | `/frontend/app/support/faqs/page.tsx` | ✅ Complete |
| **API Endpoint** | `/api/live-support` | ❌ NOT CREATED |
| **Ticket API** | `/api/live-support/ticket` | ❌ NOT CREATED |
| **Dashboard Tickets View** | `/dashboard/support-tickets` | ❌ NOT CREATED |

### 1.2 What Frontend Expects (Currently Broken)

```typescript
// Chat API Call
POST /api/live-support
Body: {
  message: string,
  userId: string,
  userEmail: string,
  userName: string,
  userProfile: object,
  conversationHistory: Message[]
}
Response: Server-Sent Events (streaming)

// Ticket API Call  
POST /api/live-support/ticket
Body: SupportTicket object
Response: { success: true, ticket: {...} }
```

---

## 2. System Architecture

### 2.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     USER OPENS LIVE SUPPORT                          │
│                    /support/live-support                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    1. AUTHENTICATION CHECK                           │
│   • If not logged in → Show login prompt                            │
│   • If logged in → Fetch complete user context                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    2. FETCH USER CONTEXT                            │
│   FROM DATABASE:                                                     │
│   • User Profile (name, email, join date, preferences)              │
│   • Active Subscriptions (agents, plans, expiry dates)              │
│   • Transaction History (purchases, refunds)                        │
│   • Previous Support Tickets (status, history)                      │
│   • Chat Sessions with agents (last used agents)                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    3. AI WELCOME MESSAGE                            │
│   "Hi {name}! I can see you're on the {plan} plan with access to   │
│    {agents}. Your subscription expires on {date}. How can I help?" │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    4. USER DESCRIBES ISSUE                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    5. AI PROCESSES & RESPONDS                       │
│                                                                      │
│   AI KNOWLEDGE BASE:                                                │
│   • FAQs (billing, features, security, etc.)                       │
│   • Documentation links                                              │
│   • Pricing information                                              │
│   • User's specific account data                                     │
│                                                                      │
│   AI CAPABILITIES:                                                   │
│   • Answer billing questions using user's transaction data          │
│   • Explain subscription status & expiry                            │
│   • Guide to documentation/tutorials                                 │
│   • Help with account settings                                       │
│   • Troubleshoot common issues                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
         ┌─────────────────┐         ┌─────────────────┐
         │  ISSUE RESOLVED │         │ NEEDS ESCALATION│
         │  "Happy to help!│         │ "I'll create a  │
         │   Anything else?"│        │   ticket..."    │
         └─────────────────┘         └────────┬────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    6. CREATE SUPPORT TICKET                         │
│   • Generate ticket ID (TICKET-{timestamp})                         │
│   • Save all conversation history                                    │
│   • Include complete user context                                    │
│   • Set priority based on issue type                                │
│   • Forward to support team                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    7. TICKET IN USER DASHBOARD                      │
│   /dashboard/support-tickets                                         │
│   • View all tickets                                                 │
│   • Check status (open, in-progress, resolved)                      │
│   • See responses from support team                                  │
│   • Reply to tickets                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    8. AI FOLLOW-UP                                  │
│   When user returns to live support:                                │
│   "Hi again! I see you have an open ticket #{id} about {issue}.    │
│    Status: {status}. Would you like an update?"                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 New Model: SupportChat (for AI conversations)

```javascript
// /frontend/lib/models/SupportChat.ts
{
  chatId: string,              // Unique chat session ID
  userId: ObjectId,            // Reference to User
  userEmail: string,
  userName: string,
  
  // User context snapshot (at time of chat)
  userContext: {
    subscriptions: [{
      agentId: string,
      agentName: string,
      plan: string,
      status: string,
      expiryDate: Date
    }],
    totalSpent: number,
    memberSince: Date,
    previousTickets: number
  },
  
  // Conversation
  messages: [{
    id: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    timestamp: Date
  }],
  
  // Outcome
  ticketCreated: boolean,
  ticketId: string,            // If escalated
  resolved: boolean,
  resolutionSummary: string,
  
  // Metadata
  status: 'active' | 'closed',
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

### 3.2 Existing SupportTicket Model (Already Complete)

Key fields we'll use:
- `ticketId`, `ticketNumber`
- `userId`, `userEmail`, `userName`
- `subject`, `description`
- `category`, `priority`, `status`
- `messages[]` (full conversation thread)
- `relatedAgent`, `relatedSubscription`
- `resolution`, `satisfaction`

---

## 4. API Endpoints

### 4.1 POST /api/live-support (Main Chat)

**Purpose**: Handle AI chat with streaming response

**Request**:
```json
{
  "message": "I can't access my agent",
  "userId": "user_id",
  "chatId": "existing_chat_id_or_null",
  "conversationHistory": [...]
}
```

**Response**: Server-Sent Events stream
```
data: {"type":"context","userContext":{...}}
data: {"type":"chunk","content":"Hi John! "}
data: {"type":"chunk","content":"I can see..."}
data: {"type":"done","chatId":"chat_123"}
```

**AI System Prompt**:
```
You are a helpful AI support agent for One Last AI. You have access to:

USER CONTEXT:
- Name: {name}
- Email: {email}
- Member since: {date}
- Active subscriptions: {list of agents with plans and expiry}
- Transaction history: {recent purchases}
- Open tickets: {list}

KNOWLEDGE BASE:
- Pricing: $1/day, $5/week, $19/month per agent
- Refund policy: Full within 30 days, 50% 30-60 days
- No auto-renewal - one-time purchases
- [Full FAQs content...]

INSTRUCTIONS:
1. Be friendly, professional, and helpful
2. Use the user's name and context
3. Try to resolve issues using the knowledge base
4. If you cannot resolve, offer to create a support ticket
5. Never make up information - if unsure, escalate
6. Provide relevant documentation links when helpful
```

### 4.2 POST /api/live-support/ticket

**Purpose**: Create a support ticket

**Request**:
```json
{
  "chatId": "chat_123",
  "subject": "Cannot access Einstein agent",
  "category": "technical",
  "priority": "medium"
}
```

**Response**:
```json
{
  "success": true,
  "ticket": {
    "ticketId": "TICKET-1706500000",
    "ticketNumber": 1001,
    "status": "open"
  }
}
```

### 4.3 GET /api/live-support/tickets

**Purpose**: Get user's support tickets

**Response**:
```json
{
  "success": true,
  "tickets": [
    {
      "ticketId": "TICKET-1706500000",
      "ticketNumber": 1001,
      "subject": "Cannot access Einstein",
      "status": "in-progress",
      "createdAt": "2026-01-17T...",
      "lastUpdate": "2026-01-17T..."
    }
  ]
}
```

### 4.4 GET /api/live-support/context

**Purpose**: Fetch full user context for AI

**Response**:
```json
{
  "success": true,
  "context": {
    "user": { "name": "John", "email": "...", "memberSince": "..." },
    "subscriptions": [...],
    "transactions": [...],
    "openTickets": [...]
  }
}
```

---

## 5. Frontend Updates

### 5.1 Enhanced Live Support Page

Current features to keep:
- Chat interface with streaming
- User profile sidebar
- Quick actions
- Download/copy chat

New features to add:
- Show user's subscription details
- Display open tickets with status
- Better AI context display
- Ticket creation flow
- Follow-up on existing tickets

### 5.2 New Dashboard Page: /dashboard/support-tickets

```tsx
// Features:
- List all user's tickets
- Filter by status (open, in-progress, resolved)
- Click to view full ticket details
- Reply to tickets
- View AI chat history that led to ticket
- Satisfaction rating after resolution
```

---

## 6. Implementation Steps

### Phase 1: Backend API (Priority 1)

1. **Create `/frontend/lib/models/SupportChat.ts`**
   - Store AI conversation sessions
   - Link to tickets if created

2. **Create `/frontend/app/api/live-support/route.ts`**
   - Fetch user context from all models
   - Call AI with full context + knowledge base
   - Stream responses back
   - Save conversation to SupportChat

3. **Create `/frontend/app/api/live-support/ticket/route.ts`**
   - Create ticket from chat
   - Include full conversation
   - Send notification (future: email)

4. **Create `/frontend/app/api/live-support/tickets/route.ts`**
   - Get user's tickets
   - Get single ticket details

### Phase 2: Frontend Enhancements (Priority 2)

5. **Update `/frontend/app/support/live-support/page.tsx`**
   - Fetch and display user context
   - Show subscription details
   - Better ticket creation flow
   - Open tickets list

6. **Create `/frontend/app/dashboard/support-tickets/page.tsx`**
   - Full ticket management
   - Status tracking
   - Reply functionality

### Phase 3: Polish (Priority 3)

7. **Add email notifications** (future)
   - Ticket created confirmation
   - Status updates
   - Team responses

8. **Add admin panel** (future)
   - View all tickets
   - Assign to team members
   - Respond to tickets

---

## 7. AI Knowledge Base Content

The AI will have access to:

### 7.1 FAQs (from /support/faqs)
- Getting Started (4 questions)
- Billing & Pricing (5 questions)
- Account & Security (6 questions)
- Features & Usage (5+ questions)

### 7.2 Key Information
```
PRICING:
- Daily: $1/day per agent
- Weekly: $5/week per agent  
- Monthly: $19/month per agent
- No auto-renewal
- One-time purchases

REFUNDS:
- Full refund within 30 days
- 50% refund 30-60 days
- No refund after 60 days

AGENTS:
- 20+ specialized AI agents
- Einstein, Tech Wizard, Chef Biew, etc.
- Each agent sold separately

SUPPORT:
- 24/7 AI Support (this system!)
- Human team: Mon-Fri 9AM-6PM EST
- Response within 48 hours for tickets
```

### 7.3 Documentation Links
- Getting Started: /docs/agents/getting-started
- API Reference: /docs/api
- Tutorials: /docs/tutorials
- FAQs: /support/faqs
- Help Center: /support/help-center

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| AI Resolution Rate | 70%+ issues resolved without ticket |
| Response Time | < 2 seconds for AI response |
| Ticket Creation | Seamless with full context |
| User Satisfaction | 4+ stars average |
| Dashboard Usage | Users check ticket status |

---

## 9. Files to Create/Modify

### New Files:
1. `/frontend/lib/models/SupportChat.ts`
2. `/frontend/app/api/live-support/route.ts`
3. `/frontend/app/api/live-support/ticket/route.ts`
4. `/frontend/app/api/live-support/tickets/route.ts`
5. `/frontend/app/api/live-support/context/route.ts`
6. `/frontend/app/dashboard/support-tickets/page.tsx`

### Modified Files:
1. `/frontend/app/support/live-support/page.tsx` (enhance)

---

## 10. Ready to Implement! 🚀

The system is well-designed with:
- ✅ Complete frontend UI
- ✅ Complete database models
- ❌ Missing API endpoints (to be created)
- ❌ Missing dashboard view (to be created)

**Estimated Implementation Time**: 2-3 hours for full system

---

_Document created: January 17, 2026_
_Project: One Last AI - Live Support System_
