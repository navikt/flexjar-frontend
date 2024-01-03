import { test, expect } from '@playwright/test'

test.describe('generelle tester for flexjar', () => {
    test('hovedsiden skal åpnes med fornuftige defaults', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByText('Flexjar 💪🫙')).toBeVisible()
        await expect(page.getByText('NEI: Compatible web-enabled superstructure')).toBeVisible()
        await expect(page.getByText('Viser 81 - 83 av 83')).toBeVisible()
        await page.getByRole('textbox', { name: 'Søk' }).fill('flexjar')
        await expect(page.getByText('Ingen tilbakemeldinger')).toBeVisible()
        await page.getByRole('textbox', { name: 'Søk' }).fill('web-enabled')
        await expect(page.getByText('Viser 1 - 2 av 2')).toBeVisible()
        await page.getByRole('textbox', { name: 'Søk' }).clear()
        await expect(page.getByText('Viser 81 - 83 av 83')).toBeVisible()
        await page.getByRole('navigation').getByRole('button', { name: '1' }).click()
        await expect(page.getByText('Viser 1 - 10 av 83')).toBeVisible()
        await expect(page.getByText('NEI: Reverse-engineered value-added utilisation')).toBeVisible()
    })
})
