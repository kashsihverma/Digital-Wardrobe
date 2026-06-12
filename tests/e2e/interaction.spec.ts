import { expect, test } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4321';

test('routes render and primary controls respond', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	for (const path of ['/', '/wardrobe', '/wardrobe/camel-blazer', '/outfits', '/planner', '/discover', '/collections', '/insights', '/settings']) {
		const response = await page.goto(`${baseURL}${path}`);
		expect(response?.ok(), path).toBeTruthy();
	}

	await page.goto(baseURL);
	await page.getByRole('button', { name: /add item/i }).first().click();
	await expect(page.getByRole('heading', { name: /add wardrobe item/i })).toBeVisible();
	await page.getByRole('button', { name: /upload image/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Upload image selected/);
	await page.getByLabel(/paste image/i).fill('https://example.com/camel-blazer.png');
	await page.getByRole('button', { name: /^save$/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/private draft/i);
	await page.getByLabel(/close upload dialog/i).click();

	await page.goto(`${baseURL}/wardrobe`);
	await page.getByRole('combobox', { name: /search wardrobe/i }).fill('sage');
	await expect(page.locator('[data-result-count]')).toHaveText('1 ITEM');
	await page.getByRole('button', { name: /save view/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Saved this wardrobe view/i);

	await page.goto(`${baseURL}/outfits`);
	await page.getByRole('button', { name: /duplicate/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Duplicated outfit/i);
	await page.getByRole('button', { name: /^save$/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Outfit saved/i);
	await page.getByRole('button', { name: /reorder/i }).first().click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Moved this piece/i);
	await page.getByRole('button', { name: /style this item/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Style helper opened/i);
	await page.getByRole('button', { name: /swap one piece/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Swapped suggestion/i);

	await page.goto(`${baseURL}/planner`);
	await page.getByRole('button', { name: /plan event/i }).click();
	await expect(page.getByRole('heading', { name: /plan an outfit/i })).toBeVisible();
	await page.getByRole('button', { name: /save event/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Event saved/i);

	await page.goto(`${baseURL}/discover`);
	await page.getByRole('button', { name: /outfits/i }).click();
	await expect(page.locator('[data-discover-status]')).toContainText(/outfits results/i);

	await page.goto(`${baseURL}/collections`);
	await page.getByRole('button', { name: /create share card/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/copied|blocked/i);

	await page.goto(`${baseURL}/wardrobe/camel-blazer`);
	await page.getByRole('button', { name: /confirm tags/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/tags confirmed/i);

	await page.goto(`${baseURL}/settings`);
	await page.getByRole('button', { name: /manage/i }).first().click();
	await expect(page.locator('[data-settings-title]')).toHaveText('Profile');
	await page.getByRole('button', { name: /save preference/i }).click();
	await expect(page.locator('#dw-toast-region')).toContainText(/Settings saved/i);

	expect(errors).toEqual([]);
});
