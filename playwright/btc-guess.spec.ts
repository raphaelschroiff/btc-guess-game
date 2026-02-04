import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // start each test with a new user to enable parallel test execution
  const randomSuffix = Math.floor(Math.random() * 10000);
  const randomUserName = `TestUser-${randomSuffix}`;
  await page.goto('/');
  await page.reload();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill(randomUserName);
  await page.getByRole('button', { name: 'Set Username' }).click();
  await expect(page.getByRole('heading', { name: `Welcome back, ${randomUserName}!` })).toBeVisible();
  await expect(page.getByText('Your Score: 0')).toBeVisible();
  await expect(page.getByText('Current BTC Price: $')).toBeVisible();
});

test('make and resolve guess - up', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');
  const priceContainer = page.locator('div:has-text("Current BTC Price:")').last();
  await expect(priceContainer).toContainText('Current BTC Price:');
  await expect(priceContainer).toContainText(/\$\d+/)
  await page.getByRole('button', { name: '⬆️ Up!' }).click();
  await expect(page.getByText('Your current guess is Up ↗️')).toBeVisible();
  await expect(page.getByText('Guess can be resolved in')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resolve Guess' })).toBeDisabled();

  await page.waitForTimeout(60000); // Wait for 60 seconds to ensure guess can be resolved
  await page.getByRole('button', { name: 'Resolve Guess' }).click();

  await expect(page.getByText('Your Score:')).toBeVisible();
  await expect(page.getByText('You guessed: Up ↗️')).toBeVisible();
  const priceTrendText = page.getByText(/Price went from \$\d+ to \$\d+/);
  await expect(priceTrendText).toBeVisible();

  const priceTrendTextContent = await priceTrendText.textContent();
  const [oldPriceStr, newPriceStr] = priceTrendTextContent!.match(/\$\d+/g)!;
  const oldPrice = parseInt(oldPriceStr.replace('$', ''), 10);
  const newPrice = parseInt(newPriceStr.replace('$', ''), 10);

  if (newPrice > oldPrice) {
    await expect(page.getByText('Your guess was correct 🎉')).toBeVisible();
  } else {
    await expect(page.getByText('Your guess was incorrect 😕')).toBeVisible();
  }

  await page.getByRole('button', { name: 'Make New Guess' }).click();
  await expect(page.getByText('Current BTC Price: $')).toBeVisible();
});

test('make and resolve guess - down', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/');
  const priceContainer = page.locator('div:has-text("Current BTC Price:")').last();
  await expect(priceContainer).toContainText('Current BTC Price:');
  await expect(priceContainer).toContainText(/\$\d+/)
  await page.getByRole('button', { name: '⬇️ Down!' }).click();
  await expect(page.getByText('Your current guess is Down ↘️')).toBeVisible();
  await expect(page.getByText('Guess can be resolved in')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Resolve Guess' })).toBeDisabled();

  await page.waitForTimeout(60000); // Wait for 60 seconds to ensure guess can be resolved
  await page.getByRole('button', { name: 'Resolve Guess' }).click();

  await expect(page.getByText('Your Score:')).toBeVisible();
  await expect(page.getByText('You guessed: Down ↘️')).toBeVisible();
  const priceTrendText = page.getByText(/Price went from \$\d+ to \$\d+/);
  await expect(priceTrendText).toBeVisible();

  const priceTrendTextContent = await priceTrendText.textContent();
  const [oldPriceStr, newPriceStr] = priceTrendTextContent!.match(/\$\d+/g)!;
  const oldPrice = parseInt(oldPriceStr.replace('$', ''), 10);
  const newPrice = parseInt(newPriceStr.replace('$', ''), 10);

  if (newPrice < oldPrice) {
    await expect(page.getByText('Your guess was correct 🎉')).toBeVisible();
  } else {
    await expect(page.getByText('Your guess was incorrect 😕')).toBeVisible();
  }

  await page.getByRole('button', { name: 'Make New Guess' }).click();
  await expect(page.getByText('Current BTC Price: $')).toBeVisible();
});

test('score persists after reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Your Score:')).toBeVisible();
  const scoreText = await page.getByText(/Your Score:/).textContent();
  await page.reload();
  await expect(page.getByText(scoreText!)).toBeVisible();
});
