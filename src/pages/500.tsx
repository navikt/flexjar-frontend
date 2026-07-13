import { Page } from '@navikt/ds-react'
import React from 'react'

function ServerError(): React.JSX.Element | boolean {
    return (
        <Page>
            <Page.Block width="xl">
                <div>Det oppsto en uforventet feil</div>
            </Page.Block>
        </Page>
    )
}

export default ServerError
