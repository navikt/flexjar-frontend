import { logger } from '@navikt/next-logger'
import { NextPageContext } from 'next'

import { isMockBackend } from '../utils/environment'

import { verifyAzureAccessToken } from './azureVerifisering'

type PageHandler = (context: NextPageContext) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function beskyttetSide(handler: PageHandler): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async function withBearerTokenHandler(context: NextPageContext): Promise<any> {
        if (isMockBackend()) {
            return handler(context)
        }

        logger.info('beskyttetSide bearertoken sjekk')
        const request = context.req
        if (request == null) {
            throw new Error('Context is missing request. This should not happen')
        }

        const wonderwallRedirect = {
            redirect: {
                destination: '/oauth2/login?redirect=/syk/sykepenger',
                permanent: false,
            },
        }
        const bearerToken: string | null | undefined = request.headers['authorization']
        if (!bearerToken) {
            logger.info('ingen bearertoken, redirecter til wonderwall')

            return wonderwallRedirect
        }
        try {
            await verifyAzureAccessToken(bearerToken)
        } catch (e) {
            logger.error(e, 'Kunne ikke autentisere.')
            return wonderwallRedirect
        }
        logger.info('alt ok')

        return handler(context)
    }
}