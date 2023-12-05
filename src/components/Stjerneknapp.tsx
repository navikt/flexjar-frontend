import { Button } from '@navikt/ds-react'
import React from 'react'
// import { useQueryClient } from '@tanstack/react-query'
import { StarIcon } from '@navikt/aksel-icons'

import { Feedback } from '../queryhooks/useFeedback'

import { addTag, deleteTag } from './Tags'

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    // const queryClient = useQueryClient()
    const [erStjerne, setErStjerne] = React.useState<boolean>(feedback.tags.includes('stjerne'))
    // use state to handle display of changes, only invalidate on errors
    const toggleStjerne = async (feedback: Feedback): Promise<void> => {
        if (feedback.tags?.includes('stjerne')) {
            await deleteTag('stjerne', feedback.id)
            setErStjerne(false)
        } else {
            await addTag('stjerne', feedback.id)
            setErStjerne(true)
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
            <StarIcon title="a11y-title" fontSize="1.5rem" className={erStjerne ? 'text-white' : ''} />
        </Button>
    )
}
