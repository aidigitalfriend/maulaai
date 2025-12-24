import { v4 as uuidv4 } from "uuid";
const mockUsers = {
  user1: {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    locale: "en-US",
    plan: "monthly",
    subscriptionStatus: "active",
    joinDate: /* @__PURE__ */ new Date("2024-01-15"),
    lastLogin: /* @__PURE__ */ new Date()
  }
};
const mockSubscriptions = {
  user1: {
    userId: "user1",
    plan: "monthly",
    status: "active",
    billingCycle: "monthly",
    nextBilling: /* @__PURE__ */ new Date("2024-11-10"),
    features: ["all_agents", "priority_support", "advanced_analytics"],
    limits: {
      monthlyRequests: 1e4,
      usedRequests: 2500,
      storageGB: 100,
      usedStorageGB: 25
    }
  }
};
const mockKnowledgeBase = [
  {
    id: "kb1",
    title: "How to reset your password",
    content: 'To reset your password: 1. Go to login page 2. Click "Forgot Password" 3. Enter your email 4. Check your email for reset link',
    category: "Auth",
    relevanceScore: 0.95,
    url: "/auth/reset-password"
  },
  {
    id: "kb2",
    title: "Subscription billing cycles",
    content: "Billing cycles: Choose $1 daily, $5 weekly, or $19 monthly per agent. Each subscription covers exactly one AI agent and renews based on the interval you pick.",
    category: "Billing",
    relevanceScore: 0.9,
    url: "/pricing"
  },
  {
    id: "kb3",
    title: "Setting up API integrations",
    content: "To integrate with external APIs: 1. Go to Settings > Integrations 2. Add your API keys 3. Test the connection 4. Enable the integration",
    category: "Integrations",
    relevanceScore: 0.88
  }
];
class SupportTools {
  /**
   * Get user profile information
   */
  static async getUserProfile(userId) {
    try {
      const profile = mockUsers[userId];
      if (!profile) {
        console.log(`User profile not found: ${userId}`);
        return null;
      }
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }
  /**
   * Get subscription status for user and specific agent
   */
  static async getSubscriptionStatus(userId, agentId) {
    try {
      const subscription = mockSubscriptions[userId];
      if (!subscription) {
        return null;
      }
      if (agentId) {
        subscription.agentId = agentId;
      }
      return subscription;
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      throw new Error("Failed to fetch subscription status");
    }
  }
  /**
   * Search knowledge base for relevant articles
   */
  static async searchKB(query, limit = 5) {
    try {
      const searchTerms = query.toLowerCase().split(" ");
      const results = mockKnowledgeBase.map((article) => {
        let score = 0;
        const content = (article.title + " " + article.content).toLowerCase();
        searchTerms.forEach((term) => {
          if (content.includes(term)) {
            score += 1;
          }
        });
        return {
          ...article,
          relevanceScore: score / searchTerms.length
        };
      }).filter((article) => article.relevanceScore > 0).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
      return results;
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      throw new Error("Failed to search knowledge base");
    }
  }
  /**
   * Classify issue based on transcript and metadata
   */
  static async classifyIssue(transcript, metadata = {}) {
    try {
      const text = transcript.toLowerCase();
      let category = "Agents";
      let subcategory = "general";
      let severity = "P3";
      let confidence = 0.5;
      let assigneeQueue = "general";
      const signals = [];
      if (text.includes("login") || text.includes("password") || text.includes("auth")) {
        category = "Auth";
        subcategory = "authentication";
        assigneeQueue = "auth-team";
        signals.push("auth_keywords");
        confidence = 0.8;
      } else if (text.includes("bill") || text.includes("payment") || text.includes("charge")) {
        category = "Billing";
        subcategory = "payment";
        assigneeQueue = "finance-team";
        signals.push("billing_keywords");
        confidence = 0.85;
      } else if (text.includes("subscription") || text.includes("plan") || text.includes("upgrade")) {
        category = "Subscriptions";
        subcategory = "plan_management";
        assigneeQueue = "subscription-team";
        signals.push("subscription_keywords");
        confidence = 0.8;
      } else if (text.includes("api") || text.includes("integration") || text.includes("connect")) {
        category = "Integrations";
        subcategory = "api_setup";
        assigneeQueue = "platform-team";
        signals.push("integration_keywords");
        confidence = 0.75;
      } else if (text.includes("bug") || text.includes("error") || text.includes("broken")) {
        category = "Bug";
        subcategory = "technical_issue";
        assigneeQueue = "engineering-team";
        signals.push("bug_keywords");
        confidence = 0.7;
      }
      if (text.includes("urgent") || text.includes("down") || text.includes("broken") || text.includes("cannot login")) {
        severity = "P1";
        signals.push("urgency_indicators");
      } else if (text.includes("important") || text.includes("major") || text.includes("not working")) {
        severity = "P2";
        signals.push("moderate_severity");
      }
      if (metadata.userPlan === "enterprise") {
        if (severity === "P3") severity = "P2";
        signals.push("enterprise_user");
      }
      const suggestedSLA = severity === "P1" ? "4 hours" : severity === "P2" ? "24 hours" : "48 hours";
      return {
        category,
        subcategory,
        severity,
        confidence,
        suggestedSLA,
        assigneeQueue,
        signals
      };
    } catch (error) {
      console.error("Error classifying issue:", error);
      throw new Error("Failed to classify issue");
    }
  }
  /**
   * Create support ticket
   */
  static async createTicket(payload) {
    try {
      const ticketId = `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`;
      const now = /* @__PURE__ */ new Date();
      const slaHours = payload.severity === "P1" ? 4 : payload.severity === "P2" ? 24 : 48;
      const slaTarget = new Date(now.getTime() + slaHours * 60 * 60 * 1e3);
      const ticket = {
        id: ticketId,
        userId: payload.userId,
        summary: payload.summary,
        category: payload.category,
        severity: payload.severity,
        status: "open",
        assignedQueue: "general-support",
        createdAt: now,
        updatedAt: now,
        slaTarget
      };
      console.log("Created ticket:", ticket);
      await this.sendTicketNotification(ticket, payload);
      return ticket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw new Error("Failed to create ticket");
    }
  }
  /**
   * Send ticket notification email
   */
  static async sendTicketNotification(ticket, payload) {
    try {
      console.log(
        `Email sent for ticket ${ticket.id} to user ${ticket.userId}`
      );
      const emailContent = {
        to: payload.userId,
        // In production, get email from user profile
        subject: `Support Ticket Created: ${ticket.id}`,
        html: `
          <h2>Support Ticket Created</h2>
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Summary:</strong> ${ticket.summary}</p>
          <p><strong>Category:</strong> ${ticket.category}</p>
          <p><strong>Severity:</strong> ${ticket.severity}</p>
          <p><strong>Expected Response:</strong> ${ticket.severity === "P1" ? "4 hours" : ticket.severity === "P2" ? "24 hours" : "48 hours"}</p>
          <p>We'll contact you at your registered email address. Reply to this email to add more details to your ticket.</p>
        `
      };
      console.log("Email content:", emailContent);
    } catch (error) {
      console.error("Error sending ticket notification:", error);
    }
  }
  /**
   * Log analytics event
   */
  static async logAnalytics(event) {
    try {
      const logEntry = {
        ...event,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        id: uuidv4()
      };
      console.log("Analytics event:", logEntry);
    } catch (error) {
      console.error("Error logging analytics:", error);
    }
  }
}
export {
  SupportTools
};
