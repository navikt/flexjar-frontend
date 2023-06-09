import { randomUUID } from 'crypto'

import dayjs from 'dayjs'

import { Feedback, FeedbackInput } from '../queryhooks/useFeedback'
import { reqToBody } from '../utils/reqToBody'
import { BackendProxyOpts, validerKall } from '../proxy/backendproxy'

let testdata: Feedback[] = [
    {
        feedback: {
            feedback: 'Dette er en test',
            svar: 'JA',
            app: 'flexjar',
            feedbackId: 'flexjartesting',
        },
        id: randomUUID(),
        opprettet: '2023-02-04T12:00:00.000000+02:00',
    },
    {
        feedback: {
            feedback: 'Dette er en test 2',
            app: 'spinnsyn',
            svar: 'JA',
            feedbackId: 'spinnsyn refusjon',
        },
        id: randomUUID(),
        opprettet: '2023-05-01T12:00:00.000000+02:00',
    },
]

function deleteFeedbackById(idToDelete: string): void {
    testdata = testdata.filter((feedback) => feedback.id !== idToDelete)
}

export async function mockApi(opts: BackendProxyOpts): Promise<void> {
    const validert = validerKall(opts)
    if (!validert) return
    const { req, res } = opts

    if (validert.api == 'GET /api/v1/intern/feedback') {
        res.status(200)
        res.json(testdata)
        res.end()
        return
    }
    if (validert.api == 'DELETE /api/v1/intern/feedback/[uuid]') {
        const id = req.url?.split('/').pop()
        deleteFeedbackById(id || '')
        res.status(204)
        res.end()
        return
    }
    if (validert.api == 'POST /api/v1/feedback/azure') {
        const body = <FeedbackInput>await reqToBody(req)
        testdata.push({
            feedback: body,
            id: randomUUID(),
            opprettet: dayjs().toISOString(),
        })
        res.status(202)
        res.end()
        return
    }

    res.status(404)
    res.end()
}
