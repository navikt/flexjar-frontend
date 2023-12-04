import { Button } from '@navikt/ds-react'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import {addTag, deleteTag} from "./Tags";
import {StarIcon} from "@navikt/aksel-icons";

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const queryClient = useQueryClient()


    async function toggleStjerne(feedback: Feedback): Promise<void> {
        if (feedback.tags?.includes('stjerne')) {
            await deleteTag('stjerne', feedback.id)
            await queryClient.invalidateQueries()
        } else {
            await addTag('stjerne', feedback.id)
            await queryClient.invalidateQueries()
        }
    }

    return (
        <Button
            onClick={async () => {
                await toggleStjerne(feedback)
            }}
            variant="primary"
        >
            <StarIcon title="a11y-title" fontSize="1.5rem" />
        </Button>
    )
}
