import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isLocalBackend, isMockBackend } from '../../../utils/environment'
import { BackendProxyOpts, proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const { serverRuntimeConfig } = getConfig()

const tillatteApier = [
    'GET /api/v1/intern/feedback',
    'GET /api/v1/intern/feedback/tags',
    'GET /api/v1/intern/feedback/teams',
    'POST /api/v1/intern/feedback/[uuid]/tags',
    'DELETE /api/v1/intern/feedback/[uuid]/tags',
    'DELETE /api/v1/intern/feedback',
    'DELETE /api/v1/intern/feedback/[uuid]',
    'POST /api/v1/feedback/azure',
]

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    function getOpts(): BackendProxyOpts {
        if (isLocalBackend()) {
            return {
                req,
                res,
                tillatteApier,
                backend: 'flexjar-backend',
                hostname: 'localhost',
            }
        }
        return {
            req,
            res,
            tillatteApier,
            backend: 'flexjar-backend',
            hostname: 'flexjar-backend',
            backendClientId: serverRuntimeConfig.flexjarBackendClientId,
        }
    }

    if (isMockBackend()) {
        return mockApi(getOpts())
    }
    await proxyKallTilBackend(getOpts())
})

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
}

export default handler
