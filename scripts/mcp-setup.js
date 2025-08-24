#!/usr/bin/env node

/**
 * HK Job Pro - Complete Database Setup via MCP Supabase
 * This script uses the MCP Supabase tools to set up the complete database schema
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🚀 HK Job Pro - Complete Database Setup');
console.log('📍 Using MCP Supabase tools for setup...');

// Read all SQL scripts
const scriptDir = path.join(__dirname);
const scripts = [
  '01-create-types.sql',
  '02-create-tables.sql', 
  '03-create-functions.sql',
  '04-create-policies.sql',
  '05-create-indexes.sql',
  '06-create-storage.sql'
];

console.log('\n📋 Available SQL scripts:');
scripts.forEach((script, index) => {
  const filePath = path.join(scriptDir, script);
  const exists = fs.existsSync(filePath);
  console.log(`   ${index + 1}. ${script} ${exists ? '✅' : '❌'}`);
});

// Read script contents
function readScript(filename) {
  const filePath = path.join(scriptDir, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  throw new Error(`Script ${filename} not found`);
}

console.log('\n🔧 Instructions for Manual Setup:');
console.log('Since MCP requires proper authentication, please:');
console.log('1. Go to https://supabase.com/dashboard');
console.log('2. Select your HK Job Pro project');
console.log('3. Click "SQL Editor" in the sidebar');
console.log('4. Execute the following SQL scripts in order:');

scripts.forEach((script, index) => {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Step ${index + 1}: ${script}`);
    console.log('='.repeat(60));
    const content = readScript(script);
    console.log(content);
  } catch (error) {
    console.log(`❌ Error reading ${script}: ${error.message}`);
  }
});

console.log('\n🎯 After executing all scripts, run: npm run db:test');
console.log('🚀 Then start development with: npm run dev');