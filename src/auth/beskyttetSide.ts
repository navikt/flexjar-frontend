import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'

import { isMockBackend } from '../utils/environment'

import { verifyAzureAccessToken } from './azureVerifisering'

type PageHandler<InitialPageProps> = (
    context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<InitialPageProps>>

export function beskyttetSide<InitialPageProps>(handler: PageHandler<InitialPageProps>) {
    return async function withBearerTokenHandler(
        context: GetServerSidePropsContext,
    ): Promise<ReturnType<NonNullable<typeof handler>>> {
        if (isMockBackend()) {
            return handler(context)
        }

        const request = context.req
        if (request == null) {
            throw new Error('Context is missing request. This should not happen')
        }

        const wonderwallRedirect = {
            redirect: {
                destination: `/oauth2/login?redirect=${context.resolvedUrl}`,
                permanent: false,
            },
        }

        const bearerToken: string | null | undefined = request.headers['authorization']
        if (!bearerToken) {
            return wonderwallRedirect
        }
        try {
            await verifyAzureAccessToken(bearerToken)
        } catch (e) {
            return wonderwallRedirect
        }

        return handler(context)
    }
}
