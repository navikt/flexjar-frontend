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
        (arg : {tag: string, newStjerneState: boolean}) => {
            return arg.newStjerneState ?  addTag(arg.tag, feedback.id) : deleteTag(arg.tag, feedback.id)
        },
        {
            onSuccess: () => {},
            onError: () => {
                setErStjerne(!erStjerne);
                queryClient.invalidateQueries();
            },
        },
    );
    const toggleStjerne = (): void => {
        const currentStjerneState = erStjerne
        setErStjerne(!erStjerne)
        mutation.mutate({tag: 'stjerne', newStjerneState: !currentStjerneState})
    }

    if (mutation.isError) return <div>Det har skjedd en feil</div>
    return (
        <Button size="small" onClick={toggleStjerne} variant={erStjerne ? 'primary' : 'secondary'}>
            <StarIcon title="a11y-stjerne" fontSize="1.5rem" className={erStjerne ? 'text-white' : ''} />
        </Button>
    )
}
