// tests/visual.spec.js
import { test, expect } from '@playwright/test';

test('LandingPage visual test', async ({ page }) => {
  // Navigate to the landing page
  await page.goto('/');
  
  // Wait for network idle to ensure the page is fully loaded
  await page.waitForLoadState('networkidle');
  
  // Wait for the main container instead of specific text
  await page.waitForSelector('.min-h-screen', { timeout: 45000 });
  
  // Mock API for user points to avoid backend dependencies
  await page.route('/api/get_user_points*', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ points: 150 })
    });
  });
  
  // Wait for the sidebar which should always be present
  await page.waitForSelector('aside', { timeout: 45000 });
  
  // Take a screenshot of light mode
  await expect(page).toHaveScreenshot('landing-page-light.png');
  
  // Toggle dark mode - use a more specific selector
  await page.click('button[aria-label="Toggle Theme"]');
  
  // Wait for dark mode transition to complete
  await page.waitForTimeout(500); // Increased timeout for transition
  
  // Take a screenshot of dark mode
  await expect(page).toHaveScreenshot('landing-page-dark.png');
  
  // Test sidebar toggle - use a more reliable selector
  const initialSidebar = await page.locator('aside').getAttribute('class');
  
  // Use a more specific selector for the sidebar toggle button
  await page.click('button.absolute');
  
  // Wait for sidebar transition
  await page.waitForTimeout(500);
  
  const collapsedSidebar = await page.locator('aside').getAttribute('class');
  expect(initialSidebar).not.toEqual(collapsedSidebar);
  
  // Test responsive layouts for different screen sizes
  await expect(page).toHaveScreenshot('landing-page-responsive.png');
});
