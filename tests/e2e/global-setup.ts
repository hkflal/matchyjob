import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up E2E test environment...')
  
  // You can perform global setup here, such as:
  // - Starting test database
  // - Seeding test data
  // - Setting up authentication tokens
  // - Warming up the application
  
  const { baseURL } = config.projects[0].use
  
  if (baseURL) {
    console.log(`🌐 Base URL: ${baseURL}`)
    
    // Optional: Verify the application is running
    try {
      const browser = await chromium.launch()
      const page = await browser.newPage()
      await page.goto(baseURL)
      await page.waitForSelector('text=Job Pro', { timeout: 10000 })
      await browser.close()
      console.log('✅ Application is running and accessible')
    } catch (error) {
      console.error('❌ Failed to verify application:', error)
      throw error
    }
  }
  
  // Setup test data or authentication if needed
  // await setupTestData()
  // await createTestUsers()
  
  console.log('🚀 E2E test environment ready!')
}

export default globalSetup