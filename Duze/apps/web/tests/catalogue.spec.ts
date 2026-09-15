import { test, expect } from '@playwright/test';

test('browse, search, basket quantities, replacement consent and keyboard dismissal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A little local. A lot to love.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Ember & Pap menu' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole('searchbox').fill('wings');
  await expect(page.getByRole('button', { name: /View .* menu/ })).toHaveCount(1);
  await page.getByRole('button', { name: 'View Ember & Pap menu' }).click();
  const panel = page.getByRole('dialog');
  await expect(panel.getByRole('heading', { name: 'Ember & Pap' })).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Add Sunday special' })).toBeDisabled();
  await panel.getByRole('button', { name: 'Add Wings Combo', exact: true }).click();
  await panel.getByRole('button', { name: 'View basket (1)' }).click();
  await expect(panel.getByText('R 78,00', { exact: true })).toHaveCount(2);
  await panel.getByRole('button', { name: 'Add one Wings Combo' }).click();
  await expect(panel.getByText('R 156,00', { exact: true })).toHaveCount(2);
  await expect(panel.getByText('Checkout is not connected yet.', { exact: false })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).not.toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('button', { name: 'View The Lunchbox menu' }).click();
  await panel.getByRole('button', { name: 'Add Chicken burger', exact: true }).click();
  await expect(panel.getByText('Switch kitchens?')).toBeVisible();
  await panel.getByRole('button', { name: 'Keep my basket' }).click();
  await panel.getByRole('button', { name: 'View basket (2)' }).click();
  await expect(panel.getByRole('heading', { name: 'Wings Combo' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'View The Lunchbox menu' }).click();
  await panel.getByRole('button', { name: 'Add Chicken burger', exact: true }).click();
  await panel.getByRole('button', { name: 'Replace basket' }).click();
  await panel.getByRole('button', { name: 'View basket (1)' }).click();
  await expect(panel.getByRole('heading', { name: 'Chicken burger' })).toBeVisible();
  await expect(panel.getByRole('heading', { name: 'Wings Combo' })).toHaveCount(0);
  await panel.getByRole('button', { name: 'Remove one Chicken burger' }).click();
  await expect(panel.getByText('Something good belongs here.')).toBeVisible();
});

test('filters, closed kitchen and no results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Stores', exact: true }).click();
  await expect(page.getByRole('button', { name: /View .* menu/ })).toHaveCount(1);
  await page.getByRole('button', { name: 'View Corner Pantry menu' }).click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Add Fresh bread' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('searchbox').fill('unfindabledish');
  await expect(page.getByText('No favourites found just yet.')).toBeVisible();
  await page.getByRole('button', { name: 'Show all kitchens' }).click();
  await expect(page.getByRole('button', { name: /View .* menu/ })).toHaveCount(5);
});

test('API failure offers recovery without fabricated catalogue', async ({ page }) => {
  await page.route('**/api/catalogue?*', route => route.fulfill({ status: 503, json: { error: 'Temporarily offline.' } }));
  await page.goto('/');
  await expect(page.getByRole('alert').filter({ hasText: 'Temporarily offline.' })).toContainText('Temporarily offline.');
  await expect(page.getByRole('button', { name: /View .* menu/ })).toHaveCount(0);
  await page.unroute('**/api/catalogue?*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('button', { name: 'View Ember & Pap menu' })).toBeVisible();
});
