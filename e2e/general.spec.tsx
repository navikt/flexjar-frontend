import { test, expect } from '@playwright/test'

test.describe('generelle tester for flexjar', () => {
    test('hovedsiden skal åpnes med fornuftige defaults', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByText('Flexjar 💪🫙')).toBeVisible()
        await expect(page.getByText('NEI: Enterprise-wide optimal methodology')).toBeVisible()
    })
})
