import { randomUUID } from 'crypto'

import dayjs from 'dayjs'
import { faker } from '@faker-js/faker'
import { nextleton } from 'nextleton'

import { Feedback, FeedbackInput } from '../queryhooks/useFeedback'
import { reqToBody } from '../utils/reqToBody'
import { BackendProxyOpts, validerKall } from '../proxy/backendproxy'

faker.seed(123)

export const testdata = nextleton('sessionStore', () => {
    return {} as Record<string, Feedback>
})

const antallFeedback = 342
for (let i = 0; i < antallFeedback; i++) {
    const id = faker.string.uuid()
    testdata[id] = {
        feedback: {
            feedback: faker.datatype.boolean() ? faker.company.catchPhrase() : '',
            svar: faker.datatype.boolean() ? 'JA' : 'NEI',
            app: faker.color.human(),
            team: faker.datatype.boolean() ? 'flex' : 'teamsykmelding',
            feedbackId: faker.science.chemicalElement().name,
        },
        id: id,
        opprettet: faker.date.past().toISOString(),
        tags: faker.datatype.boolean() ? [faker.color.human(), faker.color.human()] : [],
    }
}

for (let i = 1; i <= 5; i++) {
    const id = faker.string.uuid()
    testdata[id] = {
        feedback: {
            feedback: faker.datatype.boolean() ? faker.company.catchPhrase() : '',
            svar: `${i}`,
            app: 'sykepengesoknad',
            team: 'flex',
            feedbackId: 'sykepengesoknad-kvittering',
        },
        id: id,
        opprettet: faker.date.past().toISOString(),
        tags: [],
    }
}

const id = faker.string.uuid()
testdata[id] = {
    feedback: {
        feedback: faker.datatype.boolean() ? faker.company.catchPhrase() : '',
        svar: `Jeg har amplitudeId`,
        app: 'sykepengesoknad',
        team: 'flex',
        feedbackId: 'sykepengesoknad-kvittering',
        amplitudeDeviceId: 'G7VIgpTXMSO5LFQ6-vQDB2',
    },
    id: id,
    opprettet: faker.date.future().toISOString(),
    tags: [],
}

function deleteFeedbackById(idToDelete: string): void {
    const find = testdata[idToDelete]
    if (find) {
        find.feedback.feedback = ''
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockApi(opts: BackendProxyOpts): Promise<void> {
    const validert = validerKall(opts)
    if (!validert) return
    const { req, res } = opts

    await sleep(200)
    if (validert.api === 'GET /api/v1/intern/feedback') {
        const team = validert.query.get('team') || 'flex'
        const size = parseInt(validert.query.get('size') || '10', 10)
        const fritekst = validert.query.get('fritekst')
        const medTekst = (validert.query.get('medTekst') || 'false') === 'true'
        const starred = (validert.query.get('stjerne') || 'false') === 'true'

        const testdataSomArray = Object.values(testdata).sort((a, b) => {
            return new Date(a.opprettet).getTime() - new Date(b.opprettet).getTime()
        })

        // Filter data based on 'feedback' query parameter if it's provided
        const filteredData = testdataSomArray
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
                    return (
                        JSON.stringify(feedback.feedback).toLowerCase().includes(fritekst.toLowerCase()) ||
                        feedback.tags.some((tag) => tag.toLowerCase().includes(fritekst.toLowerCase()))
                    )
                }
                return true
            })
            .filter((feedback) => {
                if (starred) {
                    return feedback.tags.some((tag) => tag.toLowerCase().includes('stjerne'))
                }
                return true
            })

        // Implement pagination logic
        // Beregn totalt antall sider
        const totalPages = Math.ceil(filteredData.length / size)

        // Endre standard sideverdi til den siste siden hvis ikke spesifisert
        // 'page' vil nå være 0-basert, så den siste siden er 'totalPages - 1'
        const defaultPage = totalPages > 0 ? totalPages - 1 : 0
        const page = parseInt(validert.query.get('page') || `${defaultPage}`, 10)

        // Sjekk for negativ sideverdi og korrigér til første eller siste side
        const validPage = page < 0 ? 0 : page >= totalPages ? defaultPage : page

        // Oppdatert pagineringslogikk
        const paginatedData = filteredData.slice(validPage * size, (validPage + 1) * size)

        // Create a response object that includes pagination information
        const response: PageResponse = {
            content: paginatedData,
            totalPages: totalPages,
            totalElements: filteredData.length,
            size: size,
            number: validPage,
        }

        res.status(200).json(response)
        return
    }

    if (validert.api === 'DELETE /api/v1/intern/feedback/[uuid]') {
        const id = req.url?.split('/').pop()
        deleteFeedbackById(id || '')
        res.status(204)
        res.end()
        return
    }
    if (validert.api === 'POST /api/v1/feedback/azure') {
        const body = <FeedbackInput>await reqToBody(req)
        const id = randomUUID()
        testdata[id] = {
            feedback: body,
            id: id,
            opprettet: dayjs().toISOString(),
            tags: [],
        }
        res.status(202)
        res.end()
        return
    }
    if (validert.api === 'GET /api/v1/intern/feedback/teams') {
        res.status(200).json({
            teamsykmelding: ['dinesykmeldte'],
            flex: ['sykepengesoknad', 'spinnsyn-frontend'],
        })
        return
    }
    if (validert.api === 'GET /api/v1/intern/feedback/tags') {
        const tags = new Set<string>()
        Object.values(testdata).forEach((feedback) => {
            feedback.tags.forEach((tag) => {
                tags.add(tag)
            })
        })

        // tags som array
        const tagsArray = Array.from(tags)
        res.status(200).json(tagsArray)
        return
    }
    if (validert.api === 'POST /api/v1/intern/feedback/[uuid]/tags') {
        const id = req.url?.split('/')![7]

        interface AddTag {
            tag: string
        }

        if (!id) {
            res.status(400)
            res.end()
            return
        }

        const body = await reqToBody<AddTag>(req)

        const feedback = testdata[id]
        if (feedback) {
            const tagsSomSet = new Set(feedback.tags)
            tagsSomSet.add(body.tag)
            feedback.tags = Array.from(tagsSomSet)
        }

        res.status(201)
        res.end()
        return
    }

    if (validert.api === 'DELETE /api/v1/intern/feedback/[uuid]/tags') {
        const id = req.url?.split('/')![7]
        const tag = validert.query.get('tag')
        if (!id) {
            res.status(400)
            res.end()
            return
        }

        const feedback = testdata[id]
        if (feedback && tag) {
            const tagsSomSet = new Set(feedback.tags)
            tagsSomSet.delete(tag)
            feedback.tags = Array.from(tagsSomSet)
        }

        res.status(204)
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
