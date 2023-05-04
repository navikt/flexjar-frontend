import { randomUUID } from 'crypto'

import { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'

import { Feedback, FeedbackInput } from '../queryhooks/useFeedback'
import { reqToBody } from '../utils/reqToBody'

let testdata: Feedback[] = [
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
        opprettet: '2023-05-01T12:00:00.000000+02:00',
    },
]

function deleteFeedbackById(idToDelete: string): void {
    testdata = testdata.filter((feedback) => feedback.id !== idToDelete)
}

export async function mockApi(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method === 'POST') {
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
    if (req.method === 'DELETE') {
        const id = req.url?.split('/').pop()
        deleteFeedbackById(id || '')
        res.status(204)
        res.end()
        return
    }
    res.status(200)

    res.json(testdata)
    res.end()
    return
}
