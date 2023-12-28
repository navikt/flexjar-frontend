import React from 'react'
import { UNSAFE_Combobox } from '@navikt/ds-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchJsonMedRequestId, fetchMedRequestId } from '../utils/fetch'

async function fetchAllTags(): Promise<string[]> {
    const url = `/api/flexjar-backend/api/v1/intern/feedback/tags`

    const fetchet: string[] = await fetchJsonMedRequestId(url)

    return fetchet || []
}

export async function addTag(tag: string, id: string): Promise<void> {
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

export const deleteTag = async (tag: string, id: string): Promise<void> => {
    await fetch(`/api/flexjar-backend/api/v1/intern/feedback/${id}/tags?tag=${encodeURIComponent(tag)}`, {
        method: 'DELETE',
    })
}

export const Tags = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const feedbackTags = feedback.tags.filter((x) => x !== 'stjerne')
    const queryClient = useQueryClient()
    const feedbackId = feedback.id

    const { data: allTags, isError: isErrorAllTags } = useQuery({
        queryFn: fetchAllTags,
        queryKey: ['allTags'],
    })
    const allTagsUtenStjerne = allTags?.filter((x) => x !== 'stjerne') || []

    const addTagMutation = useMutation({
        onMutate: async () => {
            await queryClient.invalidateQueries()
        },
        mutationFn: ({ tag, id }: { tag: string; id: string }) => addTag(tag, id),
        onError: () => {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['allTags'],
            })
            queryClient.invalidateQueries()
        },
    })

    const deleteTagMutation = useMutation({
        mutationFn: async (tag: string) => await deleteTag(tag, feedbackId),
        onMutate: async () => {
            await queryClient.invalidateQueries()
        },
        onError: () => {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['allTags'],
            })
        },
    })

    const handleTagToggle = (tag: string, isSelected: boolean): void => {
        if (isSelected && feedbackId) {
            addTagMutation.mutate({ tag: tag, id: feedbackId })
        } else {
            deleteTagMutation.mutate(tag)
        }
    }

    if (isErrorAllTags) return <div>Det har skjedd en feil</div>
    return (
        <div>
            <UNSAFE_Combobox
                allowNewValues
                isMultiSelect
                label="Tags"
                hideLabel={true}
                options={allTagsUtenStjerne}
                selectedOptions={feedbackTags}
                onToggleSelected={(option, isSelected) => {
                    handleTagToggle(option, isSelected)
                }}
            />
        </div>
    )
}
