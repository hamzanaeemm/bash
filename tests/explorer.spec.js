const { test, expect } = require('@playwright/test');

test.describe('Bash Command Explorer', () => {
  test('should load and display command filters', async ({ page }) => {
    await page.goto('/');

    // Check if some common commands are visible in the filters
    const commonCommands = ['ls', 'cd', 'grep', 'git'];
    for (const cmd of commonCommands) {
      await expect(page.locator(`.filter-btn:has-text("${cmd}")`)).toBeVisible();
    }
  });

  test('should show details when hovering over a command option', async ({ page }) => {
    await page.goto('/');

    // Click on 'ls' filter (it might be selected by default, but let's be sure)
    await page.click('.filter-btn:has-text("ls")');

    // Find 'ls -l' option card and hover
    const lsLCard = page.locator('.option-card:has-text("ls -l")');
    await expect(lsLCard).toBeVisible();
    await lsLCard.hover();

    // Check if the overlay panel is shown
    const overlay = page.locator('#hoverOverlay');
    await expect(overlay).toHaveClass(/show/);

    // Check for specific content in the overlay
    await expect(page.locator('#overlayTitle')).toHaveText('ls -l');
    await expect(page.locator('#overlayDesc')).toContainText('Long format listing');
  });

  test('should filter commands when clicking on filter buttons', async ({ page }) => {
    await page.goto('/');

    // Click on 'grep' filter
    await page.click('.filter-btn:has-text("grep")');

    // Check if grep options are visible
    await expect(page.locator('.option-card:has-text("grep -i")')).toBeVisible();

    // Check that 'ls' options are NOT visible (they should be replaced)
    await expect(page.locator('.option-card:has-text("ls -l")')).not.toBeVisible();
  });

  test('should copy command to clipboard when clicking on a card', async ({ page }) => {
    // This test is tricky because of clipboard permissions,
    // but we can at least check if the toast appears.
    await page.goto('/');

    await page.click('.option-card:has-text("ls (default)")');

    const toast = page.locator('#copyToast');
    await expect(toast).toHaveClass(/show/);
    await expect(toast).toContainText('Copied: ls');
  });
});
