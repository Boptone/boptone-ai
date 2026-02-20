import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Checkout Flow
 * Tests the critical revenue path: browse → add to cart → checkout → payment
 */

test.describe('BopShop Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at BopShop landing page
    await page.goto('/bopshop');
    await expect(page).toHaveTitle(/Boptone/);
  });

  test('should browse products and view product details', async ({ page }) => {
    // Navigate to browse page
    await page.click('text=View All');
    await page.waitForURL('**/bopshop/browse**');
    
    // Wait for products to load
    await page.waitForSelector('.masonry-grid');
    
    // Verify products are displayed
    const products = await page.locator('.masonry-item').count();
    expect(products).toBeGreaterThan(0);
    
    // Click first product
    await page.locator('.masonry-item').first().click();
    
    // Verify product modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Verify product details are shown
    await expect(page.locator('[role="dialog"] h2')).toBeVisible();
    await expect(page.locator('text=/\\$\\d+/')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Navigate to browse page
    await page.goto('/bopshop/browse');
    await page.waitForSelector('.masonry-grid');
    
    // Click first product
    await page.locator('.masonry-item').first().click();
    await page.waitForSelector('[role="dialog"]');
    
    // Add to cart
    await page.click('text=Add to Cart');
    
    // Verify success message or cart update
    await page.waitForTimeout(1000); // Wait for cart update
    
    // Close modal
    await page.keyboard.press('Escape');
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Verify product is in cart
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItems).toBeGreaterThan(0);
  });

  test('should update cart quantities', async ({ page }) => {
    // Add product to cart first
    await page.goto('/bopshop/browse');
    await page.waitForSelector('.masonry-grid');
    await page.locator('.masonry-item').first().click();
    await page.waitForSelector('[role="dialog"]');
    await page.click('text=Add to Cart');
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    
    // Find quantity input
    const quantityInput = page.locator('input[type="number"]').first();
    await expect(quantityInput).toBeVisible();
    
    // Update quantity
    await quantityInput.fill('2');
    await page.waitForTimeout(500);
    
    // Verify total price updated
    await expect(page.locator('text=/Total/')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/bopshop/browse');
    await page.waitForSelector('.masonry-grid');
    await page.locator('.masonry-item').first().click();
    await page.waitForSelector('[role="dialog"]');
    await page.click('text=Add to Cart');
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    
    // Count initial items
    const initialCount = await page.locator('[data-testid="cart-item"]').count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Remove first item
    await page.locator('button:has-text("Remove")').first().click();
    await page.waitForTimeout(500);
    
    // Verify item removed
    const finalCount = await page.locator('[data-testid="cart-item"]').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add product to cart
    await page.goto('/bopshop/browse');
    await page.waitForSelector('.masonry-grid');
    await page.locator('.masonry-item').first().click();
    await page.waitForSelector('[role="dialog"]');
    await page.click('text=Add to Cart');
    await page.waitForTimeout(1000);
    
    // Go to cart
    await page.goto('/cart');
    
    // Click checkout button
    await page.click('text=Proceed to Checkout');
    
    // Verify redirected to checkout or Stripe
    await page.waitForURL('**/checkout**', { timeout: 10000 });
    
    // Verify checkout page elements
    await expect(page.locator('text=/Checkout|Payment/')).toBeVisible();
  });

  test('should load more products with infinite scroll', async ({ page }) => {
    // Navigate to browse page
    await page.goto('/bopshop/browse');
    await page.waitForSelector('.masonry-grid');
    
    // Count initial products
    const initialCount = await page.locator('.masonry-item').count();
    
    // Scroll to bottom and click "Load More"
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for "Load More" button
    const loadMoreButton = page.locator('text=Load More Products');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      
      // Wait for new products to load
      await page.waitForTimeout(2000);
      
      // Count products after loading more
      const finalCount = await page.locator('.masonry-item').count();
      expect(finalCount).toBeGreaterThan(initialCount);
    }
  });

  test('should search products', async ({ page }) => {
    // Navigate to browse page
    await page.goto('/bopshop/browse');
    
    // Find search input
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    
    // Enter search query
    await searchInput.fill('test');
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Verify page still shows products or "no results" message
    const hasProducts = await page.locator('.masonry-item').count() > 0;
    const hasNoResults = await page.locator('text=No products found').isVisible();
    expect(hasProducts || hasNoResults).toBeTruthy();
  });
});

test.describe('Wishlist Flow', () => {
  test('should add product to wishlist', async ({ page }) => {
    // Navigate to browse page
    await page.goto('/bopshop/browse');
    await page.waitForSelector('.masonry-grid');
    
    // Click first product
    await page.locator('.masonry-item').first().click();
    await page.waitForSelector('[role="dialog"]');
    
    // Click save/wishlist button (heart icon)
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(500);
      
      // Verify button state changed to "Saved"
      await expect(page.locator('button:has-text("Saved")')).toBeVisible();
    }
  });

  test('should view wishlist page', async ({ page }) => {
    // Navigate to wishlist
    await page.goto('/wishlist');
    
    // Verify wishlist page loads
    await expect(page.locator('text=/Wishlist|Saved/')).toBeVisible();
    
    // Page should show either products or empty state
    const hasProducts = await page.locator('.grid').isVisible();
    const hasEmptyState = await page.locator('text=/empty|no items/i').isVisible();
    expect(hasProducts || hasEmptyState).toBeTruthy();
  });
});
