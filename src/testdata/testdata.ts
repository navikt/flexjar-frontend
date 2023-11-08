import { randomUUID } from 'crypto'

import dayjs from 'dayjs'
import { logger } from '@navikt/next-logger'
import { faker } from '@faker-js/faker'

import { Feedback, FeedbackInput } from '../queryhooks/useFeedback'
import { reqToBody } from '../utils/reqToBody'
import { BackendProxyOpts, validerKall } from '../proxy/backendproxy'

faker.seed(123)

let testdata: Feedback[] = []

const antallFeedback = 11200
for (let i = 0; i < antallFeedback; i++) {
    testdata.push({
        feedback: {
            feedback: faker.datatype.boolean() ? faker.company.catchPhrase() : '',
            svar: faker.datatype.boolean() ? 'JA' : 'NEI',
            app: faker.color.human(),
            team: faker.datatype.boolean() ? 'flex' : 'teamsykmelding',
            feedbackId: faker.science.chemicalElement().name,
        },
        id: faker.string.uuid(),
        opprettet: faker.date.past().toISOString(),
    })
}

testdata.push({
    feedback: {
        feedback: 'hei',
        svar: '5',
        app: 'sykepengesoknad',
        team: faker.datatype.boolean() ? 'flex' : 'teamsykmelding',
        feedbackId: 'sykepengesoknad-kvittering',
    },
    id: faker.string.uuid(),
    opprettet: faker.date.past().toISOString(),
})

function deleteFeedbackById(idToDelete: string): void {
    testdata = testdata.filter((feedback) => feedback.id !== idToDelete)
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockApi(opts: BackendProxyOpts): Promise<void> {
    const validert = validerKall(opts)
    if (!validert) return
    const { req, res } = opts

    if (validert.api == 'GET /api/v1/intern/feedback') {
        logger.info(`Returning mocked data for feedbacks, also got query param: ${validert.query.toString()}`)

        res.status(200)
        res.json(testdata)
        res.end()
        return
    }

    if (validert.api == 'GET /api/v1/intern/feedback-pagable') {
        await sleep(500)
        const team = validert.query.get('team') || 'flex'
        const page = parseInt(validert.query.get('page') || '0', 10)
        const size = parseInt(validert.query.get('size') || '10', 10)
        const fritekst = validert.query.get('fritekst')
        const medTekst = (validert.query.get('medTekst') || 'false') == 'true'

        testdata.sort((a, b) => {
            return new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime()
        })
        // Filter data based on 'feedback' query parameter if it's provided
        const filteredData = testdata
            .filter((feedback) => {
                return feedback.feedback.team === team
            })
            .filter((feedback) => {
                if (medTekst) {
                    return feedback.feedback.feedback
                }
                return true
            })
            .filter((feedback) => {
                if (fritekst) {
                    return JSON.stringify(feedback.feedback).toLowerCase().includes(fritekst.toLowerCase())
                }
                return true
            })

        // Implement pagination logic
        const paginatedData = filteredData.slice(page * size, (page + 1) * size)

        // Create a response object that includes pagination information
        const response: PageResponse = {
            content: paginatedData,
            totalPages: Math.ceil(filteredData.length / size),
            totalElements: filteredData.length,
            size: size,
            number: page,
        }

        res.status(200).json(response)
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

export interface PageResponse {
    content: Feedback[]
    totalPages: number
    totalElements: number
    size: number
    number: number
}
