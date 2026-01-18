/**
 * AGENT TOOLS SERVICE
 * Gives agents capabilities beyond just text generation:
 * - Web Search (using DuckDuckGo/SerpAPI)
 * - URL Fetching & Content Extraction
 * - File Operations (read, analyze)
 * - Image Understanding (via vision models)
 * - Date/Time awareness
 * - Calculator/Math operations
 */

import { JSDOM } from 'jsdom';

// Tool definitions that can be exposed to AI
export const AVAILABLE_TOOLS = {
  web_search: {
    name: 'web_search',
    description: 'Search the web for current information. Use when you need up-to-date info or facts you are unsure about.',
    parameters: {
      query: { type: 'string', description: 'The search query', required: true },
      num_results: { type: 'number', description: 'Number of results (1-10)', default: 5 },
    },
  },
  fetch_url: {
    name: 'fetch_url',
    description: 'Fetch and extract content from a URL. Use when user shares a link or asks about a webpage.',
    parameters: {
      url: { type: 'string', description: 'The URL to fetch', required: true },
    },
  },
  get_current_time: {
    name: 'get_current_time',
    description: 'Get the current date and time. Use when user asks about time or you need temporal context.',
    parameters: {
      timezone: { type: 'string', description: 'Timezone (e.g., America/New_York)', default: 'UTC' },
    },
  },
  calculate: {
    name: 'calculate',
    description: 'Perform mathematical calculations. Use for any math operations.',
    parameters: {
      expression: { type: 'string', description: 'Math expression to evaluate', required: true },
    },
  },
  analyze_image: {
    name: 'analyze_image',
    description: 'Analyze an image and describe its contents. Use when user shares an image.',
    parameters: {
      image_url: { type: 'string', description: 'URL of the image', required: true },
    },
  },
};

/**
 * Web Search using DuckDuckGo Instant Answer API (free, no API key needed)
 */
export async function webSearch(query, numResults = 5) {
  try {
    // DuckDuckGo Instant Answer API
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    const results = [];

    // Abstract (main answer)
    if (data.Abstract) {
      results.push({
        title: data.Heading || 'Summary',
        snippet: data.Abstract,
        url: data.AbstractURL || '',
        source: data.AbstractSource || 'DuckDuckGo',
      });
    }

    // Related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      for (const topic of data.RelatedTopics.slice(0, numResults - results.length)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related',
            snippet: topic.Text,
            url: topic.FirstURL || '',
            source: 'DuckDuckGo',
          });
        }
      }
    }

    // If no results from DDG, try a backup approach
    if (results.length === 0) {
      // Return a message indicating search was attempted but no results
      return {
        success: true,
        query,
        results: [],
        message: `No instant results found for "${query}". The agent should try rephrasing or provide general knowledge.`,
      };
    }

    return {
      success: true,
      query,
      results: results.slice(0, numResults),
      totalResults: results.length,
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      success: false,
      query,
      error: error.message,
      results: [],
    };
  }
}

/**
 * Fetch URL and extract main content
 */
export async function fetchUrl(url) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OneLastAI/1.0; +https://onelastai.co)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const html = await response.text();

    // Parse HTML and extract content
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.sidebar', '.navigation',
      '[role="navigation"]', '[role="banner"]', '[role="complementary"]'
    ];
    unwantedSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });

    // Extract title
    const title = document.querySelector('title')?.textContent?.trim() || '';

    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

    // Try to find main content
    let mainContent = '';
    const contentSelectors = [
      'article', 'main', '[role="main"]', '.content', '.post-content',
      '.article-body', '.entry-content', '#content', '.main-content'
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element.textContent || '';
        break;
      }
    }

    // Fallback to body if no main content found
    if (!mainContent) {
      mainContent = document.body?.textContent || '';
    }

    // Clean up the content
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
      .slice(0, 8000); // Limit content length

    return {
      success: true,
      url,
      title,
      description: metaDesc,
      content: mainContent,
      contentLength: mainContent.length,
    };
  } catch (error) {
    console.error('URL fetch error:', error);
    return {
      success: false,
      url,
      error: error.message,
    };
  }
}

/**
 * Get current time with timezone support
 */
export function getCurrentTime(timezone = 'UTC') {
  try {
    const now = new Date();
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(now);

    return {
      success: true,
      timezone,
      formatted,
      iso: now.toISOString(),
      unix: Math.floor(now.getTime() / 1000),
    };
  } catch (error) {
    return {
      success: false,
      error: `Invalid timezone: ${timezone}`,
      formatted: new Date().toISOString(),
    };
  }
}

/**
 * Safe mathematical expression evaluator
 */
export function calculate(expression) {
  try {
    // Sanitize: only allow numbers, basic operators, parentheses, and math functions
    const sanitized = expression
      .replace(/[^0-9+\-*/().%^sqrt\s,sincostalogexpabsfloorceileroundpowmin max]/gi, '')
      .trim();

    if (!sanitized) {
      throw new Error('Invalid expression');
    }

    // Replace common math functions with Math. equivalents
    const prepared = sanitized
      .replace(/\^/g, '**')
      .replace(/sqrt\(/gi, 'Math.sqrt(')
      .replace(/sin\(/gi, 'Math.sin(')
      .replace(/cos\(/gi, 'Math.cos(')
      .replace(/tan\(/gi, 'Math.tan(')
      .replace(/log\(/gi, 'Math.log10(')
      .replace(/ln\(/gi, 'Math.log(')
      .replace(/exp\(/gi, 'Math.exp(')
      .replace(/abs\(/gi, 'Math.abs(')
      .replace(/floor\(/gi, 'Math.floor(')
      .replace(/ceil\(/gi, 'Math.ceil(')
      .replace(/round\(/gi, 'Math.round(')
      .replace(/pow\(/gi, 'Math.pow(')
      .replace(/min\(/gi, 'Math.min(')
      .replace(/max\(/gi, 'Math.max(')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e(?![xp])/gi, 'Math.E');

    // Evaluate using Function constructor (safer than eval)
    const result = new Function(`"use strict"; return (${prepared})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Result is not a valid number');
    }

    return {
      success: true,
      expression,
      result,
      formatted: result.toLocaleString('en-US', { maximumFractionDigits: 10 }),
    };
  } catch (error) {
    return {
      success: false,
      expression,
      error: `Could not evaluate: ${error.message}`,
    };
  }
}

/**
 * Execute a tool by name
 */
export async function executeTool(toolName, params) {
  switch (toolName) {
    case 'web_search':
      return webSearch(params.query, params.num_results);

    case 'fetch_url':
      return fetchUrl(params.url);

    case 'get_current_time':
      return getCurrentTime(params.timezone);

    case 'calculate':
      return calculate(params.expression);

    case 'analyze_image':
      // This would be handled by the AI provider's vision capability
      return {
        success: true,
        message: 'Image analysis should be handled by vision-enabled AI model',
        image_url: params.image_url,
      };

    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}

/**
 * Parse tool calls from AI response (for models that support function calling)
 */
export function parseToolCalls(response) {
  // Look for tool call patterns in the response
  const toolCallPattern = /\[TOOL:(\w+)\]\s*({[^}]+})/g;
  const toolCalls = [];

  let match;
  while ((match = toolCallPattern.exec(response)) !== null) {
    try {
      const toolName = match[1];
      const params = JSON.parse(match[2]);
      toolCalls.push({ tool: toolName, params });
    } catch {
      // Invalid JSON, skip
    }
  }

  return toolCalls;
}

/**
 * Format tool results for AI context
 */
export function formatToolResults(results) {
  return results.map(r => {
    if (r.tool === 'web_search' && r.result.results) {
      const searchResults = r.result.results.map(
        (res, i) => `${i + 1}. **${res.title}**\n   ${res.snippet}\n   Source: ${res.url}`
      ).join('\n\n');
      return `## Web Search Results for "${r.result.query}":\n\n${searchResults || 'No results found.'}`;
    }

    if (r.tool === 'fetch_url' && r.result.success) {
      return `## Content from ${r.result.url}:\n**Title:** ${r.result.title}\n\n${r.result.content.slice(0, 3000)}...`;
    }

    if (r.tool === 'get_current_time' && r.result.success) {
      return `## Current Time (${r.result.timezone}):\n${r.result.formatted}`;
    }

    if (r.tool === 'calculate' && r.result.success) {
      return `## Calculation:\n${r.result.expression} = **${r.result.formatted}**`;
    }

    return `## Tool Result (${r.tool}):\n${JSON.stringify(r.result, null, 2)}`;
  }).join('\n\n---\n\n');
}

/**
 * Get tool descriptions for system prompt
 */
export function getToolDescriptions() {
  return `
## Available Tools

You have access to the following tools. When you need to use a tool, include a tool call in your response using this format:
[TOOL:tool_name]{"param1": "value1", "param2": "value2"}

### Tools:

1. **web_search** - Search the web for current information
   Usage: [TOOL:web_search]{"query": "your search query"}
   Use when: You need current/recent information, facts you're unsure about, or real-time data.

2. **fetch_url** - Fetch and read content from a URL
   Usage: [TOOL:fetch_url]{"url": "https://example.com"}
   Use when: User shares a URL or asks about a specific webpage.

3. **get_current_time** - Get current date and time
   Usage: [TOOL:get_current_time]{"timezone": "America/New_York"}
   Use when: User asks about time or you need temporal context.

4. **calculate** - Perform mathematical calculations
   Usage: [TOOL:calculate]{"expression": "sqrt(144) + 5^2"}
   Use when: You need to perform any math calculations.

IMPORTANT: 
- Only use tools when necessary - don't use them for general conversation.
- After using a tool, explain the results naturally in your response.
- You can use multiple tools in one response if needed.
`;
}

export default {
  AVAILABLE_TOOLS,
  webSearch,
  fetchUrl,
  getCurrentTime,
  calculate,
  executeTool,
  parseToolCalls,
  formatToolResults,
  getToolDescriptions,
};
