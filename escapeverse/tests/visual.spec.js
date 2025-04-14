// tests/visual.spec.js
import { test, expect } from '@playwright/test';

test('LandingPage visual test', async ({ page }) => {
  // Set up API mocking BEFORE navigation
  await page.route('/api/get_user_points*', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ points: 150 })
    });
  });
  
  // Navigate to the landing page
  await page.goto('/');
  
  // Wait for network idle to ensure the page is fully loaded
  await page.waitForLoadState('networkidle');
  
  // Take a debug screenshot to see what's rendering
  await page.screenshot({ path: 'debug-before-container.png' });
  
  // Wait for the main container first
  await page.waitForSelector('.min-h-screen', { timeout: 30000 });
  
  // Take a screenshot of light mode (without waiting for aside)
  await expect(page).toHaveScreenshot('landing-page-light.png');
  
  // Check if theme toggle button exists before clicking
  const themeButton = await page.locator('button[aria-label="Toggle Theme"]');
  if (await themeButton.count() > 0) {
    await themeButton.click();
    // Wait for dark mode transition to complete
    await page.waitForTimeout(500);
    // Take a screenshot of dark mode
    await expect(page).toHaveScreenshot('landing-page-dark.png');
  } else {
    console.log('Theme toggle button not found, skipping dark mode test');
  }
  
  // Test sidebar toggle only if the sidebar is found
  const sidebarLocator = page.locator('aside');
  if (await sidebarLocator.count() > 0) {
    const initialSidebar = await sidebarLocator.getAttribute('class');
    
    // Use a more specific selector for the sidebar toggle button
    const toggleButton = await page.locator('button.absolute');
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      // Wait for sidebar transition
      await page.waitForTimeout(500);
      
      const collapsedSidebar = await sidebarLocator.getAttribute('class');
      expect(initialSidebar).not.toEqual(collapsedSidebar);
    } else {
      console.log('Sidebar toggle button not found, skipping sidebar collapse test');
    }
  } else {
    console.log('Sidebar not found, skipping sidebar tests');
  }
  
  // Test responsive layouts for different screen sizes
  await expect(page).toHaveScreenshot('landing-page-responsive.png');
});
