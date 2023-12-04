// import { json } from 'stream/consumers'
import React, { useEffect, useState } from 'react'
import { UNSAFE_Combobox } from '@navikt/ds-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchJsonMedRequestId, fetchMedRequestId } from '../utils/fetch'

const fetchAllTags = async (): Promise<string[]> => {
    const url = `/api/flexjar-backend/api/v1/intern/feedback/tags`

    const fetchet: string[] = await fetchJsonMedRequestId(url)

    return fetchet || []
}

const addTag = async (tag: string, id: string): Promise<void> => {
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

const getFilteredTags = (allTags: string[] | undefined, selectedTags: string[] | undefined): string[] => {
    if (!allTags || !selectedTags) return []

    const selectedSet = new Set(selectedTags)
    return allTags.filter((tag) => !selectedSet.has(tag))
}

export const Tags = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const [componentTags, setComponentTags] = useState<string[]>(feedback.tags || [])
    const [filteredTags, setFilteredTags] = useState<string[]>([])
    const queryClient = useQueryClient()
    const feedbackId = feedback.id

    const { data: allTags, isError: isErrorAllTags } = useQuery(['allTags'], fetchAllTags) // ,

    const addTagMutation = useMutation({
        onMutate: async ({ tag }) => {
            setComponentTags([...componentTags, tag])
        },
        mutationFn: ({ tag, id }: { tag: string; id: string }) => addTag(tag, id),
        onError: () => {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allTags'])
        },
    })

    const deleteTagMutation = useMutation((tag: string) => deleteTag(tag, feedbackId), {
        onMutate: async (tag) => {
            setComponentTags((old) => old?.filter((t) => t !== tag) || [])
        },
        onError: () => {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['allTags'])
        },
    })

    const handleTagToggle = (tag: string, isSelected: boolean): void => {
        if (isSelected && feedbackId) {
            addTagMutation.mutate({ tag: tag, id: feedbackId })
        } else {
            deleteTagMutation.mutate(tag)
        }
    }

    useEffect(() => {
        setFilteredTags(getFilteredTags(allTags, componentTags))
    }, [allTags, componentTags])

    if (isErrorAllTags) return <div>Det har skjedd en feil</div>
    return (
        <div>
            <UNSAFE_Combobox
                allowNewValues
                isMultiSelect
                label="Tags:"
                options={filteredTags || []}
                selectedOptions={componentTags || []}
                onToggleSelected={(option, isSelected) => {
                    handleTagToggle(option, isSelected)
                }}
            />
        </div>
    )
}
