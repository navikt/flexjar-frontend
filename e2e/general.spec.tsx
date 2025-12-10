import { test, expect } from '@playwright/test'

test.describe('generelle tester for flexjar', () => {
    test('hovedsiden skal åpnes med fornuftige defaults', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByText('Flexjar')).toBeVisible()
        const søkeboks = page.getByRole('textbox', { name: 'Søk' })

        await søkeboks.fill('Re-engineered secondary functionalities')
        await expect(page.getByText('NEI: Re-engineered secondary functionalities')).toBeVisible()

        await søkeboks.clear()
        await expect(page.getByText('Viser 91 - 95 av 95')).toBeVisible()

        await søkeboks.fill('flexjar')
        await expect(page.getByText('Ingen tilbakemeldinger')).toBeVisible()

        await søkeboks.fill('tertiary')
        await expect(page.getByText('Viser 1 - 2 av 2')).toBeVisible()

        await søkeboks.clear()
        await expect(page.getByText('Viser 91 - 95 av 95')).toBeVisible()

        await page.getByRole('navigation').getByRole('button', { name: '1', exact: true }).click()
        await expect(page.getByText('Viser 1 - 10 av 95')).toBeVisible()

        await expect(page.getByText('NEI: Inverse 6th generation database')).toBeVisible()
    })
})
