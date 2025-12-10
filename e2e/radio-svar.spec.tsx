import { test, expect } from '@playwright/test'

test.describe('radio svar', () => {
    test('Svar med hovedvalg og undervalg vises med fin formatering', async ({ page }) => {
        await page.goto('/')

        await page.getByRole('textbox', { name: 'Søk' }).fill('spinnsyn-vedtak')
        await expect(
            page.getByRole('cell', { name: 'Hovedvalg: Litt vanskelig, undervalg: Svaret manglet viktig informasjon' }),
        ).toBeVisible()
    })
})
