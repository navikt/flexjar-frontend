import { Button } from '@navikt/ds-react'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchMedRequestId } from '../utils/fetch'

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const queryClient = useQueryClient()

    async function addTag(tag: string, id: string): Promise<void> {
        const url = `/api/flexjar-backend/api/v1/intern/feedback/${id}/tags`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        }
        fetchMedRequestId(url, options)
    }

    const deleteTag = async (tag: string, id: string): Promise<void> => {
        await fetch(`/api/flexjar-backend/api/v1/intern/feedback/${id}/tags?tag=${encodeURIComponent(tag)}`, {
            method: 'DELETE',
        })
    }

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
            stjerne
        </Button>
    )
}
