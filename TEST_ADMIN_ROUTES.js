/**
 * Quick Admin Routes Verification Script
 *
 * This script tests the refactored admin routes to ensure they work correctly.
 * Run this after starting the server to verify all admin endpoints.
 *
 * Usage:
 * 1. Start the server: npm run dev
 * 2. In another terminal: node TEST_ADMIN_ROUTES.js
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3000';
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual admin token

// Test configuration
const tests = [
  {
    name: 'Admin Ping',
    method: 'GET',
    path: '/api/admin/ping',
    expectedStatus: 200,
  },
  {
    name: 'Get Users',
    method: 'GET',
    path: '/api/admin/users',
    expectedStatus: 200,
  },
  {
    name: 'Get Sources',
    method: 'GET',
    path: '/api/admin/sources',
    expectedStatus: 200,
  },
  {
    name: 'Get Destinations',
    method: 'GET',
    path: '/api/admin/destinations',
    expectedStatus: 200,
  },
  {
    name: 'Get Subscription Plans',
    method: 'GET',
    path: '/api/admin/subscription-plans',
    expectedStatus: 200,
  },
  {
    name: 'Get Analytics',
    method: 'GET',
    path: '/api/admin/analytics',
    expectedStatus: 200,
  },
  {
    name: 'Get Stats',
    method: 'GET',
    path: '/api/admin/stats',
    expectedStatus: 200,
  },
  {
    name: 'Get Health',
    method: 'GET',
    path: '/api/admin/system/health',
    expectedStatus: 200,
  },
];

// Make HTTP request
function makeRequest(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(SERVER_URL + test.path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: test.method,
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = res.statusCode === test.expectedStatus;

        resolve({
          test: test.name,
          status: res.statusCode,
          expectedStatus: test.expectedStatus,
          success,
          data: data.substring(0, 200), // Truncate long responses
        });
      });
    });

    req.on('error', (error) => {
      reject({
        test: test.name,
        success: false,
        error: error.message,
      });
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Admin Routes Verification...\n');
  console.log(`Server: ${SERVER_URL}`);
  console.log(`Token: ${ADMIN_TOKEN.substring(0, 20)}...\n`);

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test);
      results.push(result);

      if (result.success) {
        console.log(`✅ ${result.test}`);
        console.log(`   Status: ${result.status} (expected: ${result.expectedStatus})`);
        passed++;
      } else {
        console.log(`❌ ${result.test}`);
        console.log(`   Status: ${result.status} (expected: ${result.expectedStatus})`);
        if (result.data) {
          console.log(`   Response: ${result.data}`);
        }
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${error.test}`);
      console.log(`   Error: ${error.error}`);
      failed++;
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${passed} ✅`);
  console.log(`   Failed: ${failed} ❌`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Admin routes are working correctly.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.\n');
  }

  process.exit(failed === 0 ? 0 : 1);
}

runTests();
