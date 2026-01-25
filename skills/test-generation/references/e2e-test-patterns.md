# E2E Test Patterns

End-to-end testing patterns with Playwright.

## E2E Test Characteristics

| Characteristic | Description |
|----------------|-------------|
| **Scope** | Full user journey through real UI |
| **Speed** | Slowest (seconds to minutes) |
| **Confidence** | Highest (tests real user experience) |
| **Maintenance** | Higher cost to maintain |
| **Flakiness** | Most prone to intermittent failures |

## Playwright Setup

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Basic E2E Patterns

### Page Navigation

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates to home page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/My App/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });
  
  test('navigates between pages', async ({ page }) => {
    await page.goto('/');
    
    // Click navigation link
    await page.click('nav >> text=About');
    
    // Verify navigation
    await expect(page).toHaveURL('/about');
    await expect(page.locator('h1')).toContainText('About Us');
  });
});
```

### Form Submission

```typescript
test.describe('Contact Form', () => {
  test('submits form successfully', async ({ page }) => {
    await page.goto('/contact');
    
    // Fill form
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="message"]', 'Hello, this is a test message.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('.success-message')).toContainText('Message sent!');
  });
  
  test('shows validation errors', async ({ page }) => {
    await page.goto('/contact');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Verify errors
    await expect(page.locator('[data-error="name"]')).toContainText('Name is required');
    await expect(page.locator('[data-error="email"]')).toContainText('Email is required');
  });
  
  test('validates email format', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[data-error="email"]')).toContainText('Invalid email');
  });
});
```

### Authentication Flow

```typescript
test.describe('Authentication', () => {
  test('logs in successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('test@example.com');
  });
  
  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });
  
  test('logs out successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Verify logged out
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });
});
```

## Page Object Model

### Page Objects

```typescript
// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.locator('[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
  }
  
  async goto() {
    await this.page.goto('/login');
  }
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
  
  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}

// pages/DashboardPage.ts
export class DashboardPage {
  readonly page: Page;
  readonly userMenu: Locator;
  readonly welcomeMessage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.welcomeMessage = page.locator('[data-testid="welcome"]');
  }
  
  async expectLoggedInAs(email: string) {
    await expect(this.userMenu).toContainText(email);
  }
  
  async logout() {
    await this.userMenu.click();
    await this.page.click('text=Logout');
  }
}
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication with Page Objects', () => {
  test('logs in successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoggedInAs('test@example.com');
  });
  
  test('shows error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    await loginPage.login('test@example.com', 'wrongpassword');
    
    await loginPage.expectError('Invalid credentials');
  });
});
```

## Complex User Journeys

### E-Commerce Checkout

```typescript
test.describe('Checkout Flow', () => {
  test('completes purchase successfully', async ({ page }) => {
    // Browse products
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Add item to cart
    await page.click('[data-testid="product-1"] >> text=Add to Cart');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
    
    // Add another item
    await page.click('[data-testid="product-2"] >> text=Add to Cart');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page).toHaveURL('/cart');
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(2);
    
    // Proceed to checkout
    await page.click('text=Checkout');
    await expect(page).toHaveURL('/checkout');
    
    // Fill shipping info
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'New York');
    await page.fill('[name="zip"]', '10001');
    await page.click('text=Continue to Payment');
    
    // Fill payment info (test card)
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');
    
    // Place order
    await page.click('text=Place Order');
    
    // Verify confirmation
    await expect(page).toHaveURL(/\/order\/[a-z0-9]+/);
    await expect(page.locator('[data-testid="confirmation"]')).toContainText('Order Confirmed');
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
  });
  
  test('handles out of stock items', async ({ page }) => {
    await page.goto('/cart');
    
    // Add out of stock item (via direct URL or API)
    await page.goto('/products/out-of-stock-item');
    
    await expect(page.locator('text=Out of Stock')).toBeVisible();
    await expect(page.locator('text=Add to Cart')).toBeDisabled();
  });
});
```

### Multi-Step Wizard

```typescript
test.describe('Account Setup Wizard', () => {
  test('completes all steps', async ({ page }) => {
    await page.goto('/setup');
    
    // Step 1: Personal Info
    await expect(page.locator('[data-step="1"]')).toHaveAttribute('data-active', 'true');
    await page.fill('[name="fullName"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.click('text=Next');
    
    // Step 2: Preferences
    await expect(page.locator('[data-step="2"]')).toHaveAttribute('data-active', 'true');
    await page.click('[data-testid="theme-dark"]');
    await page.check('[name="emailNotifications"]');
    await page.click('text=Next');
    
    // Step 3: Confirmation
    await expect(page.locator('[data-step="3"]')).toHaveAttribute('data-active', 'true');
    await expect(page.locator('[data-testid="summary-name"]')).toContainText('John Doe');
    await expect(page.locator('[data-testid="summary-email"]')).toContainText('john@example.com');
    await page.click('text=Complete Setup');
    
    // Verify completion
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome"]')).toContainText('Welcome, John');
  });
  
  test('can go back and edit', async ({ page }) => {
    await page.goto('/setup');
    
    // Complete step 1
    await page.fill('[name="fullName"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.click('text=Next');
    
    // Go back
    await page.click('text=Back');
    
    // Verify data preserved
    await expect(page.locator('[name="fullName"]')).toHaveValue('John Doe');
    
    // Edit
    await page.fill('[name="fullName"]', 'Jane Doe');
    await page.click('text=Next');
    await page.click('text=Next');
    
    // Verify updated in summary
    await expect(page.locator('[data-testid="summary-name"]')).toContainText('Jane Doe');
  });
});
```

## API Mocking in E2E

```typescript
test.describe('With Mocked API', () => {
  test('displays products from API', async ({ page }) => {
    // Mock API response
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Test Product', price: 1000 },
          { id: '2', name: 'Another Product', price: 2000 },
        ])
      });
    });
    
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="product"]')).toHaveCount(2);
    await expect(page.locator('text=Test Product')).toBeVisible();
  });
  
  test('handles API error', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to load products'
    );
  });
  
  test('shows loading state', async ({ page }) => {
    // Delay response
    await page.route('**/api/products', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.goto('/products');
    
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="loading"]')).not.toBeVisible({ timeout: 2000 });
  });
});
```

## Visual Testing

```typescript
test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
  });
  
  test('product card matches snapshot', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid="product-1"]');
    await expect(productCard).toHaveScreenshot('product-card.png');
  });
  
  test('dark mode matches snapshot', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="theme-toggle"]');
    
    await expect(page).toHaveScreenshot('homepage-dark.png');
  });
});
```

## Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('form has proper labels', async ({ page }) => {
    await page.goto('/contact');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('form')
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('can navigate with keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'nav-home');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'nav-products');
    
    // Activate with Enter
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/products');
  });
});
```

## Test Fixtures

```typescript
// fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
    
    // Cleanup: logout after test
    await page.goto('/logout');
  },
});

// Usage
test('dashboard shows user data', async ({ authenticatedPage }) => {
  await expect(authenticatedPage.locator('[data-testid="welcome"]')).toBeVisible();
});
```

## Handling Flaky Tests

```typescript
// Retry configuration
test.describe('Flaky-Prone Tests', () => {
  // Retry this specific test
  test('eventually succeeds', async ({ page }) => {
    test.info().annotations.push({ type: 'flaky', description: 'Network dependent' });
    
    await page.goto('/');
    // Use explicit waits instead of implicit
    await page.waitForSelector('[data-testid="loaded"]', { timeout: 10000 });
  });
});

// Wait for network idle
test('waits for all requests', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
});

// Wait for specific request
test('waits for API response', async ({ page }) => {
  const responsePromise = page.waitForResponse('**/api/data');
  await page.goto('/');
  await responsePromise;
});
```
