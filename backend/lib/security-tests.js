const BACKEND_URL = process.env.BACKEND_URL || "https://maula.ai";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const colors = {
  reset: "\x1B[0m",
  green: "\x1B[32m",
  red: "\x1B[31m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m"
};
function log(status, message) {
  const color = status === "PASS" ? colors.green : status === "FAIL" ? colors.red : status === "WARN" ? colors.yellow : colors.blue;
  console.log(`${color}[${status}]${colors.reset} ${message}`);
}
async function testAuthenticationEnforcement() {
  console.log(
    `
${colors.blue}=== TEST SUITE 1: AUTHENTICATION ENFORCEMENT ===${colors.reset}
`
  );
  const tests = [
    {
      name: "Request without Authorization header should fail",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentId: "comedy-king", message: "Hello" })
          });
          if (response.status === 401) {
            log("PASS", "Correctly rejected request without auth");
            return true;
          } else {
            log("FAIL", `Expected 401, got ${response.status}`);
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    },
    {
      name: "Request with invalid token should fail",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer invalid.token.here"
            },
            body: JSON.stringify({ agentId: "comedy-king", message: "Hello" })
          });
          if (response.status === 401) {
            log("PASS", "Correctly rejected invalid token");
            return true;
          } else {
            log("FAIL", `Expected 401, got ${response.status}`);
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    },
    {
      name: "Request with malformed Authorization header should fail",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "InvalidHeader invalid.token"
            },
            body: JSON.stringify({ agentId: "comedy-king", message: "Hello" })
          });
          if (response.status === 401) {
            log("PASS", "Correctly rejected malformed auth header");
            return true;
          } else {
            log("FAIL", `Expected 401, got ${response.status}`);
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    }
  ];
  let passed = 0;
  for (const test of tests) {
    const result = await test.test();
    if (result) passed++;
  }
  return { total: tests.length, passed };
}
async function testRateLimiting() {
  console.log(
    `
${colors.blue}=== TEST SUITE 2: RATE LIMITING ===${colors.reset}
`
  );
  const tests = [
    {
      name: "Rate limit headers should be present",
      async test() {
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/agents/config/comedy-king`,
            {
              headers: {
                Authorization: "Bearer valid-token-needed"
              }
            }
          );
          const hasRateLimitHeaders = response.headers.has("X-RateLimit-Limit") && response.headers.has("X-RateLimit-Remaining") && response.headers.has("X-RateLimit-Reset");
          if (hasRateLimitHeaders) {
            log("PASS", "Rate limit headers present");
            return true;
          } else {
            log("WARN", "Rate limit headers missing (auth may be required)");
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    }
  ];
  let passed = 0;
  for (const test of tests) {
    const result = await test.test();
    if (result) passed++;
  }
  return { total: tests.length, passed };
}
async function testInputValidation() {
  console.log(
    `
${colors.blue}=== TEST SUITE 3: INPUT VALIDATION ===${colors.reset}
`
  );
  const tests = [
    {
      name: "Empty request body should fail",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token"
            },
            body: JSON.stringify({})
          });
          if (response.status === 400) {
            log("PASS", "Correctly rejected empty body");
            return true;
          } else {
            log("WARN", `Expected 400, got ${response.status}`);
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    },
    {
      name: "SQL injection attempt should be rejected",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer test-token"
            },
            body: JSON.stringify({
              agentId: "'; DROP TABLE users; --",
              message: "Hello"
            })
          });
          if (response.status >= 400) {
            log("PASS", "Correctly rejected SQL injection");
            return true;
          } else {
            log(
              "WARN",
              `Got ${response.status} - validation may not be strict enough`
            );
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    }
  ];
  let passed = 0;
  for (const test of tests) {
    const result = await test.test();
    if (result) passed++;
  }
  return { total: tests.length, passed };
}
async function testErrorHandling() {
  console.log(
    `
${colors.blue}=== TEST SUITE 4: ERROR HANDLING ===${colors.reset}
`
  );
  const tests = [
    {
      name: "Error response should not contain stack traces",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/agents/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer invalid"
            },
            body: JSON.stringify({ agentId: "test", message: "test" })
          });
          const data = await response.json();
          const hasStackTrace = JSON.stringify(data).includes("at ") || JSON.stringify(data).includes("/backend/") || JSON.stringify(data).includes("Error:");
          if (!hasStackTrace) {
            log("PASS", "No stack trace in error response");
            return true;
          } else {
            log("FAIL", "Stack trace or path exposed in error");
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    },
    {
      name: "Error message should be generic (not expose implementation)",
      async test() {
        try {
          const response = await fetch(
            `${BACKEND_URL}/api/agents/invalid-endpoint`,
            {
              headers: { Authorization: "Bearer test" }
            }
          );
          const data = await response.json();
          const message = JSON.stringify(data).toLowerCase();
          const leaksImplementation = message.includes("undefined") || message.includes("null") || message.includes("function") || message.includes("prototype");
          if (!leaksImplementation) {
            log("PASS", "Error message is generic");
            return true;
          } else {
            log("WARN", "Error message may leak implementation details");
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    }
  ];
  let passed = 0;
  for (const test of tests) {
    const result = await test.test();
    if (result) passed++;
  }
  return { total: tests.length, passed };
}
async function testSecurityHeaders() {
  console.log(
    `
${colors.blue}=== TEST SUITE 5: SECURITY HEADERS ===${colors.reset}
`
  );
  const tests = [
    {
      name: "X-Content-Type-Options header should be present",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/health`);
          if (response.headers.has("X-Content-Type-Options")) {
            log("PASS", "X-Content-Type-Options header present");
            return true;
          } else {
            log("WARN", "X-Content-Type-Options header missing");
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    },
    {
      name: "X-Frame-Options header should be present",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/health`);
          if (response.headers.has("X-Frame-Options")) {
            log("PASS", "X-Frame-Options header present");
            return true;
          } else {
            log("WARN", "X-Frame-Options header missing");
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    },
    {
      name: "CORS should be restricted",
      async test() {
        try {
          const response = await fetch(`${BACKEND_URL}/api/health`);
          const corsHeader = response.headers.get(
            "Access-Control-Allow-Origin"
          );
          if (corsHeader && corsHeader !== "*") {
            log("PASS", `CORS restricted to: ${corsHeader}`);
            return true;
          } else if (corsHeader === "*") {
            log("FAIL", "CORS is unrestricted (*)");
            return false;
          } else {
            log("WARN", "CORS header not found");
            return false;
          }
        } catch (error) {
          log("FAIL", `Error: ${error}`);
          return false;
        }
      }
    }
  ];
  let passed = 0;
  for (const test of tests) {
    const result = await test.test();
    if (result) passed++;
  }
  return { total: tests.length, passed };
}
async function testFrontendSecurity() {
  console.log(
    `
${colors.blue}=== TEST SUITE 6: FRONTEND SECURITY ===${colors.reset}
`
  );
  const tests = [
    {
      name: "Frontend source maps should be disabled in production",
      async test() {
        try {
          const response = await fetch(
            `${FRONTEND_URL}/_next/static/chunks/main.js.map`
          );
          if (response.status === 404) {
            log("PASS", "Source maps disabled");
            return true;
          } else {
            log("FAIL", "Source maps exposed (accessible)");
            return false;
          }
        } catch (error) {
          log("WARN", "Could not verify source maps");
          return false;
        }
      }
    },
    {
      name: "Frontend security headers should be present",
      async test() {
        try {
          const response = await fetch(`${FRONTEND_URL}/`);
          const hasSecurityHeaders = response.headers.has("X-Content-Type-Options") || response.headers.has("X-Frame-Options");
          if (hasSecurityHeaders) {
            log("PASS", "Frontend security headers present");
            return true;
          } else {
            log("WARN", "Frontend security headers missing");
            return false;
          }
        } catch (error) {
          log("WARN", "Could not verify frontend headers");
          return false;
        }
      }
    }
  ];
  let passed = 0;
  for (const test of tests) {
    const result = await test.test();
    if (result) passed++;
  }
  return { total: tests.length, passed };
}
async function runAllTests() {
  console.log(`${colors.blue}
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551     SECURITY TEST SUITE - PRODUCTION CHECK    \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D
${colors.reset}
`);
  const suites = [
    await testAuthenticationEnforcement(),
    await testRateLimiting(),
    await testInputValidation(),
    await testErrorHandling(),
    await testSecurityHeaders(),
    await testFrontendSecurity()
  ];
  const totalTests = suites.reduce((sum, s) => sum + s.total, 0);
  const totalPassed = suites.reduce((sum, s) => sum + s.passed, 0);
  const passPercentage = Math.round(totalPassed / totalTests * 100);
  console.log(
    `
${colors.blue}\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550${colors.reset}`
  );
  console.log(
    `${colors.green}SUMMARY: ${totalPassed}/${totalTests} tests passed (${passPercentage}%)${colors.reset}`
  );
  console.log(
    `${colors.blue}\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550${colors.reset}
`
  );
  if (passPercentage === 100) {
    log("PASS", "All security tests passed! Ready for production. \u2705");
  } else if (passPercentage >= 80) {
    log("WARN", "Most tests passed. Review warnings before launch.");
  } else {
    log("FAIL", "Security issues detected. Fix before production!");
  }
}
runAllTests().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
