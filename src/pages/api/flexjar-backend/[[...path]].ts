import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { mockApi } from '../../../testdata/testdata'

const { serverRuntimeConfig } = getConfig()

const tillatteApier = [
    'GET /api/v1/intern/feedback',
    'GET /api/v1/intern/tags',
    'POST /api/v1/intern/feedback/[uuid]/tags',
    'DELETE /api/v1/intern/feedback/[uuid]/tags',
    'DELETE /api/v1/intern/feedback',
    'GET /api/v1/intern/feedback-pagable',
    'DELETE /api/v1/intern/feedback/[uuid]',
    'POST /api/v1/feedback/azure',
]

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    const opts = {
        req,
        res,
        tillatteApier,
        backend: 'flexjar-backend',
        hostname: 'flexjar-backend',
        backendClientId: serverRuntimeConfig.flexjarBackendClientId,
    }
    if (isMockBackend()) {
        return mockApi(opts)
    }
    await proxyKallTilBackend(opts)
})

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
}

export default handler
