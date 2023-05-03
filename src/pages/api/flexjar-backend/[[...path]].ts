import { NextApiRequest, NextApiResponse } from 'next'
import getConfig from 'next/config'

import { beskyttetApi } from '../../../auth/beskyttetApi'
import { isMockBackend } from '../../../utils/environment'
import { proxyKallTilBackend } from '../../../proxy/backendproxy'
import { Feedback } from '../../../queryhooks/useFeedback'

const { serverRuntimeConfig } = getConfig()

const tillatteApier = ['GET /api/v1/intern/feedback']

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
    if (isMockBackend()) {
        res.status(200)
        const feedback: Feedback[] = [
            {
                feedback: {
                    feedback: 'Dette er en test',
                    app: 'flexjar',
                    feedbackId: 'flexjartesting',
                },
                id: '1',
                opprettet: '2023-02-04T12:00:00.000000+02:00',
            },
            {
                feedback: {
                    feedback: 'Dette er en test 2',
                    app: 'spinnsyn',
                    feedbackId: 'spinnsyn refusjon',
                },
                id: '2',
                opprettet: '2023-05-04T12:00:00.000000+02:00',
            },
        ]
        res.json(feedback)
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
