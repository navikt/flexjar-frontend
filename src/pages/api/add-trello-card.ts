import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '@navikt/next-logger'

import { Feedback } from '../../queryhooks/useFeedback'
import { notNull, raise } from '../../utils/ts-utils'

type TrelloAuth = {
    key: string
    token: string
}

type TrelloConfig = {
    trello: TrelloAuth
    board: string
    targetList: string
    templateList: string
}

const teamToResources: Record<string, TrelloConfig> = {
    teamsykmelding: {
        trello: {
            key: process.env.TEAMSYKMELDING_TRELLO_KEY ?? raise('Missing TEAMSYKMELDING_TRELLO_KEY'),
            token: process.env.TEAMSYKMELDING_TRELLO_TOKEN ?? raise('Missing TEAMSYKMELDING_TRELLO_TOKEN'),
        },
        board: 'SaGVJEqv',
        targetList: '650c0d622eec7a27cdb211dc',
        templateList: '64354a739adde25d862242b5',
    },
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' })
        return
    }

    const team = req.query.team
    if (team == null || typeof team !== 'string' || teamToResources[team] == null) {
        res.status(400).json({ message: 'Invalid team' })
        return
    }

    const feedback: Feedback = JSON.parse(req.body)
    const trello = new TrelloClient(teamToResources[team])

    try {
        await trello.addFeedbackToTrello(feedback)

        res.status(200).json({ message: 'ok' })
    } catch (e) {
        logger.error(new Error('Kunne ikke legge til kort i Trello', { cause: e }))
        res.status(500).json({ message: 'Kunne ikke legge til kort i Trello' })
    }
}

class TrelloClient {
    private auth: TrelloAuth
    private config: TrelloConfig

    constructor(config: TrelloConfig) {
        this.auth = config.trello
        this.config = config
    }

    public async addFeedbackToTrello(feedback: Feedback): Promise<void> {
        const segmentLabelId = await this.getLabelId(this.config.board, feedback.feedback.segment)
        const categoryLabelId = await this.getLabelId(this.config.board, feedback.feedback.arbeidssituasjon)

        await this.addCardToTrelloList(
            this.config.targetList,
            {
                title: `Ny tilbakemelding fra bruker`,
                desc: `**Tilbakemelding:**\n\n${feedback.feedback.svar}: ${
                    feedback.feedback.feedback ?? 'Ingen tilbakemelding'
                }`,
            },
            [segmentLabelId, categoryLabelId].filter(notNull),
        )
    }

    private async addCardToTrelloList(
        listId: string,
        content: {
            title: string
            desc: string
        },
        labels: string[],
    ): Promise<void> {
        const response = await fetch(`https://api.trello.com/1/cards?key=${this.auth.key}&token=${this.auth.token}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idList: listId,
                name: content.title,
                desc: content.desc,
                idLabels: labels.join(','),
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to add card', { cause: `Trello response: ${await response.text()}` })
        }

        return
    }

    private async getLabelId(board: string, labelName: string): Promise<string | null> {
        const labels = await this.getLabelsFromBoard(board)
        const label = labels.find((label) => label?.name?.toLowerCase() === labelName?.toLowerCase())

        return label?.id ?? null
    }

    private async getLabelsFromBoard(boardId: string): Promise<{ id: string; name: string }[]> {
        const url = `https://api.trello.com/1/boards/${boardId}/labels?key=${this.auth.key}&token=${this.auth.token}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Failed to fetch labels')
        }

        return await response.json()
    }
}

export default handler
