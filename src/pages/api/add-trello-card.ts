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

type TrelloLabel = {
    id: string
    name: string
    idBoard: string
}

class TrelloClient {
    private auth: TrelloAuth
    private config: TrelloConfig

    constructor(config: TrelloConfig) {
        this.auth = config.trello
        this.config = config
    }

    public async addFeedbackToTrello(feedback: Feedback): Promise<void> {
        const tags = feedback.tags ?? []
        const labelsInBoard = await this.getLabelsFromBoard(this.config.board)
        const baseLabelsPromises = [
            feedback.feedback.app ? this.getLabelById(labelsInBoard, feedback.feedback.app) : null,
            feedback.feedback.segment ? this.getLabelById(labelsInBoard, feedback.feedback.segment) : null,
            feedback.feedback.arbeidssituasjon
                ? this.getLabelById(labelsInBoard, feedback.feedback.arbeidssituasjon)
                : null,
        ].filter(notNull)

        const labelIds = await Promise.all([
            ...baseLabelsPromises,
            ...tags.map((tag) => this.getLabelById(labelsInBoard, tag)),
        ])

        await this.addCardToTrelloList(
            this.config.targetList,
            {
                title: `Ny tilbakemelding fra bruker i ${feedback.feedback.app}`,
                desc: `**Tilbakemelding:**\n\n${feedback.feedback.svar}: ${
                    feedback.feedback.feedback ?? 'Ingen tilbakemelding'
                }`,
            },
            labelIds.filter(notNull),
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

    private async getLabelById(labels: TrelloLabel[], labelName: string): Promise<string> {
        const label = labels.find((label) => label?.name?.toLowerCase() === labelName?.toLowerCase())

        if (label == null) {
            const idBoard = labels[0].idBoard
            const createdLabel = await this.createLabel(idBoard, labelName, getRandomColor())

            return createdLabel.id
        }

        return label.id
    }

    private async createLabel(
        // This is NOT the same as the board id, but the id of the board in the trello api >:(
        idBoard: string,
        labelName: string,
        color: string,
    ): Promise<TrelloLabel> {
        const params = new URLSearchParams({
            key: this.auth.key,
            token: this.auth.token,
            idBoard,
            color,
            name: labelName,
        })

        const response = await fetch(`https://api.trello.com/1/labels?${params.toString()}`, {
            method: 'POST',
        })

        if (!response.ok) {
            throw new Error(
                `Failed to create label, ${response.status} ${
                    response.statusText
                }, trello says: ${await response.text()}`,
            )
        }

        return await response.json()
    }

    private async getLabelsFromBoard(boardId: string): Promise<TrelloLabel[]> {
        const url = `https://api.trello.com/1/boards/${boardId}/labels?key=${this.auth.key}&token=${this.auth.token}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Failed to fetch labels')
        }

        return await response.json()
    }
}

const colors = ['purple', 'blue', 'red', 'green', 'orange', 'black', 'sky', 'pink', 'lime'] as const
function getRandomColor(): string {
    const index = Math.floor(Math.random() * colors.length)

    return colors[index]
}

export default handler
