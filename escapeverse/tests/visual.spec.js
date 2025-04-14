// tests/visual.spec.js
import { test, expect } from '@playwright/test';

test('LandingPage visual test', async ({ page }) => {
  // Navigate to the landing page
  await page.goto('/');
  
  // Wait for the page to fully load
  await page.waitForSelector('text=Escapeverse');
  
  // Take a screenshot of light mode
  await expect(page).toHaveScreenshot('landing-page-light.png');
  
  // Toggle dark mode
  await page.click('button[aria-label="Toggle Theme"]');
  
  // Wait for dark mode transition to complete
  await page.waitForTimeout(300);
  
  // Take a screenshot of dark mode
  await expect(page).toHaveScreenshot('landing-page-dark.png');
  
  // Test sidebar toggle
  const initialSidebar = await page.locator('aside').getAttribute('class');
  await page.click('button:has(svg[data-testid="ChevronLeft"])');
  await page.waitForTimeout(300);
  const collapsedSidebar = await page.locator('aside').getAttribute('class');
  expect(initialSidebar).not.toEqual(collapsedSidebar);
  
  // Test responsive layouts for different screen sizes
  await expect(page).toHaveScreenshot('landing-page-responsive.png');
});
