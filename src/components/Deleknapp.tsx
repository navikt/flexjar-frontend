import { Button, Tooltip } from '@navikt/ds-react'
import React, { ReactElement, useState } from 'react'
import { useRouter } from 'next/router'
import { RobotSmileIcon, CheckmarkIcon } from '@navikt/aksel-icons'
import { logger } from '@navikt/next-logger'

import { Feedback } from '../queryhooks/useFeedback'

export const Deleknapp = ({ feedback }: { feedback: Feedback }): ReactElement => {
    const [delt, setDelt] = useState(false)
    const [deling, setDeling] = useState(false)
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'

    const delTilbakemeldingTilSlack = async (): Promise<void> => {
        setDeling(true)
        const res = await fetch('/api/slack', {
            method: 'POST',
            body: JSON.stringify({ feedback, team: selectedTeam }),
        })

        if (res.ok) {
            setDeling(false)
            setDelt(true)
        } else {
            setDeling(false)
            logger.error(`Error: ${res.status} - ${res.statusText}`)
        }
    }

    if (delt) {
        return <Button variant="tertiary" icon={<CheckmarkIcon />} disabled />
    }

    return (
        <Tooltip content={`Del til team ${selectedTeam} på Slack`}>
            <Button
                variant="tertiary"
                icon={<RobotSmileIcon />}
                onClick={() => delTilbakemeldingTilSlack()}
                loading={deling}
            />
        </Tooltip>
    )
}