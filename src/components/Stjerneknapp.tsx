import { Button } from '@navikt/ds-react'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { StarIcon } from '@navikt/aksel-icons'

import { Feedback } from '../queryhooks/useFeedback'

import { addTag, deleteTag } from './Tags'

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const queryClient = useQueryClient()

    const toggleStjerne = async (feedback: Feedback): Promise<void> => {
        if (feedback.tags?.includes('stjerne')) {
            await deleteTag('stjerne', feedback.id)
            await queryClient.invalidateQueries()
        } else {
            await addTag('stjerne', feedback.id)
            await queryClient.invalidateQueries()
        }
    }

    const erStjerne = feedback.tags?.includes('stjerne')

    return (
        <Button
            size="small"
            onClick={async () => {
                await toggleStjerne(feedback)
            }}
            variant={erStjerne ? 'primary' : 'secondary'}
        >
            <StarIcon title="a11y-title" fontSize="1.5rem" className={erStjerne ? 'text-white' : ''} />
        </Button>
    )
}
