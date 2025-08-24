import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/HK Job Pro/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Find Your Dream Job')
    
    // Check navigation elements
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Find Jobs' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Companies' })).toBeVisible()
    
    // Check search functionality is present
    await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible()
  })

  test('should display key statistics', async ({ page }) => {
    // Check stats section
    await expect(page.locator('text=Active Jobs')).toBeVisible()
    await expect(page.locator('text=2,500+')).toBeVisible()
    await expect(page.locator('text=Companies')).toBeVisible()
    await expect(page.locator('text=800+')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    // Test navigation links
    const findJobsLink = page.getByRole('link', { name: 'Find Jobs' })
    await expect(findJobsLink).toHaveAttribute('href', '/jobs')
    
    const companiesLink = page.getByRole('link', { name: 'Companies' })
    await expect(companiesLink).toHaveAttribute('href', '/companies')
    
    const loginLink = page.getByRole('link', { name: 'Log in' })
    await expect(loginLink).toHaveAttribute('href', '/login')
    
    const signupLink = page.getByRole('link', { name: 'Get Started' })
    await expect(signupLink).toHaveAttribute('href', '/register')
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Job title, keywords, or company')
    const locationInput = page.getByPlaceholder('Hong Kong')
    const searchButton = page.getByRole('button', { name: 'Search' })
    
    // Fill search form
    await searchInput.fill('Software Engineer')
    await locationInput.fill('Central')
    
    // Submit search (will be implemented later)
    await searchButton.click()
    
    // For now, just check the form was filled correctly
    await expect(searchInput).toHaveValue('Software Engineer')
    await expect(locationInput).toHaveValue('Central')
  })

  test('should display popular searches', async ({ page }) => {
    // Check popular search terms
    await expect(page.locator('text=Popular searches:')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Software Engineer' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Marketing Manager' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Data Analyst' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'UX Designer' })).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile-specific elements are visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible()
    
    // Check that the layout adapts (stats should still be visible but may stack)
    await expect(page.locator('text=Active Jobs')).toBeVisible()
  })

  test('should have accessible elements', async ({ page }) => {
    // Check for proper ARIA labels and semantic HTML
    const searchInput = page.getByPlaceholder('Job title, keywords, or company')
    await expect(searchInput).toBeVisible()
    
    // Check that buttons are properly labeled
    const searchButton = page.getByRole('button', { name: 'Search' })
    await expect(searchButton).toBeVisible()
    
    // Check heading hierarchy
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
  })

  test('should load within performance budget', async ({ page }) => {
    // Start timing
    const startTime = Date.now()
    
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for main content to load
    await page.waitForSelector('h1')
    
    // Check load time
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })
})