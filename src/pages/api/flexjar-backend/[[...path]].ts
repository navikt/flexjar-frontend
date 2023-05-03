import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'

const { serverRuntimeConfig } = getConfig()

const tillatteApier = ['GET /api/v1/intern/feedback']

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    if (isMockBackend()) {
        res.status(200)
        res.json([])
        res.end()
        return
    }

    await proxyKallTilBackend({
        req,
        res,
        tillatteApier,
        backend: 'flexjar-backend',
        hostname: 'flexjar-backend',
        backendClientId: serverRuntimeConfig.flexjarBackendClientId,
    })
})

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
}

export default handler
