import { expect, test, type Page } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4321';
const goto = (page: Page, path: string) => page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });

test('routes render and primary controls respond', async ({ page }) => {
	test.setTimeout(60000);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	for (const path of ['/', '/dashboard', '/wardrobe', '/wardrobe/camel-blazer', '/outfits', '/planner', '/discover', '/collections', '/insights', '/settings', '/sign-in']) {
		const response = await goto(page, path);
		expect(response?.ok(), path).toBeTruthy();
	}

	await goto(page, '/');
	await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
	await expect(page.getByRole('button', { name: /add item/i })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Product', exact: true })).toBeVisible();

	await goto(page, '/dashboard');
	await expect(page.getByRole('heading', { name: /sign in to open your wardrobe/i })).toBeVisible();
	await expect(page.locator('a[href="/sign-in?redirect=%2Fdashboard"]')).toBeVisible();

	for (const path of ['/wardrobe', '/outfits', '/planner', '/discover', '/collections', '/insights', '/settings']) {
		await goto(page, path);
		await expect(page.getByRole('heading', { name: /sign in to open your wardrobe/i })).toBeVisible();
	}

	await goto(page, '/sign-in');
	await expect(page.getByRole('heading', { name: /your closet data stays behind your account/i })).toBeVisible();
	await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();

	expect(errors).toEqual([]);
});
