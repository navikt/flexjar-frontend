import { test, expect } from '@playwright/test'

test.describe('generelle tester for flexjar', () => {
    test('hovedsiden skal åpnes med fornuftige defaults', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByText('Flexjar')).toBeVisible()
        await expect(page.getByText('NEI: Reactive stable functionalities')).toBeVisible()
        await expect(page.getByText('Viser 91 - 94 av 94')).toBeVisible()
        await page.getByRole('textbox', { name: 'Søk' }).fill('flexjar')
        await expect(page.getByText('Ingen tilbakemeldinger')).toBeVisible()
        await page.getByRole('textbox', { name: 'Søk' }).fill('tertiary')
        await expect(page.getByText('Viser 1 - 3 av 3')).toBeVisible()
        await page.getByRole('textbox', { name: 'Søk' }).clear()
        await expect(page.getByText('Viser 91 - 94 av 94')).toBeVisible()
        await page.getByRole('navigation').getByRole('button', { name: '1', exact: true }).click()
        await expect(page.getByText('Viser 1 - 10 av 94')).toBeVisible()
        await expect(page.getByText('NEI: Polarised directional analyzer')).toBeVisible()
    })
})
