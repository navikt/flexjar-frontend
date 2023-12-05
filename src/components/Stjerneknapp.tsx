import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@navikt/ds-react'
import { StarIcon } from '@navikt/aksel-icons'

import { Feedback } from '../queryhooks/useFeedback'

import { addTag, deleteTag } from './Tags'

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const [erStjerne, setErStjerne] = React.useState<boolean>(feedback.tags.includes('stjerne'))
    const queryClient = useQueryClient()

    const mutation = useMutation(
        (tag: string) => {
            return erStjerne ? deleteTag(tag, feedback.id) : addTag(tag, feedback.id)
        },
        {
            onSuccess: () => {},
            onError: () => {
                setErStjerne(!erStjerne)
                queryClient.invalidateQueries()
            },
        },
    )

    const toggleStjerne = (): void => {
        setErStjerne(!erStjerne)
        mutation.mutate('stjerne')
    }

    if (mutation.isError) return <div>Det har skjedd en feil</div>
    return (
        <Button size="small" onClick={toggleStjerne} variant={erStjerne ? 'primary' : 'secondary'}>
            <StarIcon title="a11y-stjerne" fontSize="1.5rem" className={erStjerne ? 'text-white' : ''} />
        </Button>
    )
}
