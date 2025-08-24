#!/usr/bin/env node

/**
 * HK Job Pro - Supabase Test Runner
 * Executes all Supabase tests and logs detailed results
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🧪 HK Job Pro - Supabase Test Suite Runner');
console.log('=' .repeat(60));

// Test configuration
const testConfig = {
  testDir: __dirname,
  outputDir: path.join(__dirname, '../../test-results'),
  timestamp: new Date().toISOString(),
  suiteResults: {}
};

// Ensure output directory exists
if (!fs.existsSync(testConfig.outputDir)) {
  fs.mkdirSync(testConfig.outputDir, { recursive: true });
}

// Test suites to run
const testSuites = [
  {
    name: 'Database Schema',
    file: 'database-schema.test.js',
    description: 'Tests database tables, types, and constraints'
  },
  {
    name: 'RLS Policies', 
    file: 'rls-policies.test.js',
    description: 'Tests row-level security and access control'
  },
  {
    name: 'Functions & Triggers',
    file: 'functions-triggers.test.js', 
    description: 'Tests database functions and triggers'
  },
  {
    name: 'Storage Buckets',
    file: 'storage-buckets.test.js',
    description: 'Tests file storage and upload policies'
  }
];

// Function to run a single test suite
async function runTestSuite(suite) {
  return new Promise((resolve) => {
    console.log(`\n📋 Running: ${suite.name}`);
    console.log(`📄 File: ${suite.file}`);
    console.log(`📝 Description: ${suite.description}`);
    console.log('-'.repeat(50));

    const testProcess = spawn('npx', ['jest', suite.file, '--verbose', '--no-coverage'], {
      cwd: testConfig.testDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let stdout = '';
    let stderr = '';
    const startTime = Date.now();

    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output);
    });

    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    testProcess.on('close', (code) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        suite: suite.name,
        file: suite.file,
        description: suite.description,
        exitCode: code,
        duration: duration,
        timestamp: new Date().toISOString(),
        stdout: stdout,
        stderr: stderr,
        passed: code === 0,
        summary: extractTestSummary(stdout)
      };

      testConfig.suiteResults[suite.name] = result;

      console.log(`\n${code === 0 ? '✅' : '❌'} ${suite.name}: ${code === 0 ? 'PASSED' : 'FAILED'}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      
      if (result.summary) {
        console.log(`📊 Tests: ${result.summary.tests} | Passed: ${result.summary.passed} | Failed: ${result.summary.failed}`);
      }

      resolve(result);
    });
  });
}

// Function to extract test summary from Jest output
function extractTestSummary(output) {
  try {
    const lines = output.split('\n');
    
    // Look for Jest summary line
    const summaryLine = lines.find(line => 
      line.includes('passed') || line.includes('failed')
    );

    if (summaryLine) {
      const testMatch = summaryLine.match(/(\d+) passed/);
      const failMatch = summaryLine.match(/(\d+) failed/);
      const totalMatch = summaryLine.match(/(\d+) total/);

      return {
        tests: totalMatch ? parseInt(totalMatch[1]) : 0,
        passed: testMatch ? parseInt(testMatch[1]) : 0,
        failed: failMatch ? parseInt(failMatch[1]) : 0
      };
    }
  } catch (error) {
    console.warn('Could not parse test summary:', error.message);
  }
  
  return null;
}

// Function to generate detailed report
function generateDetailedReport() {
  const report = {
    metadata: {
      timestamp: testConfig.timestamp,
      environment: 'development',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      nodeVersion: process.version,
      testFramework: 'Jest'
    },
    summary: {
      totalSuites: testSuites.length,
      passedSuites: 0,
      failedSuites: 0,
      totalDuration: 0,
      overallStatus: 'UNKNOWN'
    },
    suites: testConfig.suiteResults,
    recommendations: []
  };

  // Calculate summary
  Object.values(testConfig.suiteResults).forEach(result => {
    if (result.passed) {
      report.summary.passedSuites++;
    } else {
      report.summary.failedSuites++;
    }
    report.summary.totalDuration += result.duration;
  });

  report.summary.overallStatus = report.summary.failedSuites === 0 ? 'PASSED' : 'FAILED';

  // Generate recommendations
  if (report.summary.failedSuites > 0) {
    report.recommendations.push('Review failed test cases and fix underlying issues');
    report.recommendations.push('Check Supabase project configuration and permissions');
    report.recommendations.push('Verify all environment variables are set correctly');
  }

  if (report.summary.totalDuration > 60000) {
    report.recommendations.push('Consider optimizing test performance - tests took over 1 minute');
  }

  return report;
}

// Main execution function
async function runAllTests() {
  console.log(`🌐 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`📅 Test Run: ${testConfig.timestamp}`);
  console.log(`🎯 Total Test Suites: ${testSuites.length}`);

  const startTime = Date.now();

  // Run each test suite sequentially
  for (const suite of testSuites) {
    try {
      await runTestSuite(suite);
    } catch (error) {
      console.error(`💥 Error running ${suite.name}:`, error.message);
      testConfig.suiteResults[suite.name] = {
        suite: suite.name,
        file: suite.file,
        exitCode: 1,
        duration: 0,
        timestamp: new Date().toISOString(),
        passed: false,
        error: error.message
      };
    }
  }

  const totalDuration = Date.now() - startTime;

  // Generate and save detailed report
  const report = generateDetailedReport();
  const reportPath = path.join(testConfig.outputDir, `supabase-test-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST EXECUTION COMPLETE');
  console.log('='.repeat(60));
  console.log(`📊 Overall Status: ${report.summary.overallStatus}`);
  console.log(`✅ Passed Suites: ${report.summary.passedSuites}/${testSuites.length}`);
  console.log(`❌ Failed Suites: ${report.summary.failedSuites}/${testSuites.length}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms`);
  console.log(`📄 Detailed Report: ${reportPath}`);

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`   • ${rec}`));
  }

  // Print individual suite results
  console.log('\n📋 Suite Results:');
  Object.values(testConfig.suiteResults).forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`   ${status} - ${result.suite} (${result.duration}ms)`);
    
    if (result.summary) {
      console.log(`     Tests: ${result.summary.tests} | Passed: ${result.summary.passed} | Failed: ${result.summary.failed}`);
    }
    
    if (!result.passed && result.error) {
      console.log(`     Error: ${result.error}`);
    }
  });

  // Exit with appropriate code
  process.exit(report.summary.failedSuites === 0 ? 0 : 1);
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Fatal error running tests:', error);
  process.exit(1);
});