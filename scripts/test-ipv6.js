const { execSync } = require('child_process');

console.log('🔍 Testing IPv6 connectivity for Supabase database...\n');

// Test basic IPv6 connectivity
try {
  console.log('1. Testing IPv6 connectivity to Google DNS...');
  execSync('ping6 -c 3 2001:4860:4860::8888', { stdio: 'inherit' });
  console.log('✅ IPv6 connectivity is working\n');
} catch (error) {
  console.log('❌ IPv6 connectivity failed\n');
}

// Test DNS resolution for Supabase
try {
  console.log('2. Testing DNS resolution for Supabase host...');
  const host = process.env.DB_HOST;
  if (host) {
    console.log(`Testing host: ${host}`);
    const result = execSync(`nslookup -query=AAAA ${host}`, { encoding: 'utf8' });
    console.log('DNS Result:', result);

    if (result.includes('has AAAA address')) {
      console.log('✅ Supabase host has IPv6 address\n');
    } else {
      console.log('❌ Supabase host does not have IPv6 address\n');
    }
  } else {
    console.log('❌ DB_HOST environment variable not set\n');
  }
} catch (error) {
  console.log('❌ DNS resolution failed\n');
}

// Test database connection
try {
  console.log('3. Testing database connection...');
  require('./migrate.js');
} catch (error) {
  console.log('❌ Database connection failed\n');

  // Provide alternative solutions
  console.log('\n🚨 ALTERNATIVE SOLUTIONS:');
  console.log('1. Upgrade Supabase to paid plan for IPv4 support');
  console.log('2. Use a different database provider with IPv4 support');
  console.log('3. Set up IPv6 tunnel using Hurricane Electric (free)');
  console.log('4. Use Cloudflare Warp for IPv6 connectivity');
  console.log('\n💡 Quick IPv6 tunnel setup:');
  console.log('   Visit: https://tunnelbroker.net/');
  console.log('   Create free account and tunnel');
  console.log('   Follow setup instructions for Ubuntu');
}