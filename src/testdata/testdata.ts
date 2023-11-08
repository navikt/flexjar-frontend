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

function deleteFeedbackById(idToDelete: string): void {
    testdata = testdata.filter((feedback) => feedback.id !== idToDelete)
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
        const page = parseInt(validert.query.get('page') || '0', 10)
        const size = parseInt(validert.query.get('size') || '10', 10)
        const team = validert.query.get('team') || 'flex'
        const medTekst = (validert.query.get('medTekst') || 'false') == 'true'

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

        // Implement pagination logic
        const paginatedData = filteredData.slice(page * size, (page + 1) * size)

        // Create a response object that includes pagination information
        const response = {
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
