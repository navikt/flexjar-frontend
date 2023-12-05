import { Button } from '@navikt/ds-react'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { StarIcon } from '@navikt/aksel-icons'

import { Feedback } from '../queryhooks/useFeedback'

import { addTag, deleteTag } from './Tags'

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const [erStjerne, setErStjerne] = React.useState<boolean>(feedback.tags.includes('stjerne'))
    const queryClient = useQueryClient()

    const toggleStjerne = async (feedback: Feedback): Promise<void> => {
        try {
            if (erStjerne) {
                setErStjerne(false)
                await deleteTag('stjerne', feedback.id)
            } else {
                setErStjerne(true)
                await addTag('stjerne', feedback.id)
            }
        } catch (err) {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
        }
    }

    return (
        <Button
            size="small"
            onClick={async () => {
                await toggleStjerne(feedback)
            }}
            variant={erStjerne ? 'primary' : 'secondary'}
        >
            <StarIcon title="a11y-stjerne" fontSize="1.5rem" className={erStjerne ? 'text-white' : ''} />
        </Button>
    )
}
