import type { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'
import { logger } from '@navikt/next-logger'

import type { Feedback } from '../../queryhooks/useFeedback'

type InputBody = {
    team: string
    feedback: Feedback
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' })
        return
    }

    const { team, feedback }: InputBody = JSON.parse(req.body)

    const webhook = teamToSlackWebhook[team]

    if (!webhook) {
        res.status(400).json({ message: 'Invalid team, no configured webhook' })
        return
    }

    const otherFields = Object.entries(feedback.feedback).filter(
        ([key]) => key !== 'feedback' && key !== 'app' && key !== 'feedbackId' && key !== 'svar',
    )

    const result = await fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            blocks: [
                {
                    type: 'header',
                    text: {
                        type: 'plain_text',
                        text: `Feedback i ${feedback.feedback.app}`,
                        emoji: true,
                    },
                },
                {
                    type: 'section',
                    fields: [
                        {
                            type: 'plain_text',
                            text: feedback.feedback.feedback
                                ? `${feedback.feedback.svar}: ${feedback.feedback.feedback}`
                                : `${feedback.feedback.svar}`,
                            emoji: true,
                        },
                        ...otherFields.map(([key, value]) => ({
                            type: 'plain_text',
                            text: `${key}: ${value}`,
                            emoji: true,
                        })),
                    ],
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'plain_text',
                            text: `${dayjs(feedback.opprettet).toISOString()}`,
                            emoji: true,
                        },
                    ],
                },
            ],
        }),
    })

    if (result.ok) {
        res.status(200).json({ message: 'ok' })
    } else {
        logger.error(`Unable to post to slack: ${await result.text()}`)
        res.status(500).json({ message: 'Failed to send feedback to slack' })
    }
}

const teamToSlackWebhook: Record<string, string | undefined> = {
    flex: process.env.FLEX_SLACK_WEBHOOK,
    teamsykmelding: process.env.TEAMSYKMELDING_SLACK_WEBHOOK,
}

export default handler
