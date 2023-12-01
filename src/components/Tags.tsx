// import { json } from 'stream/consumers'

import React from 'react'
import { UNSAFE_Combobox } from '@navikt/ds-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { FetchError, fetchMedRequestId } from '../utils/fetch'

const urlPrefix = '/api/flexjar-backend' // wtf wtf wtf

async function fetchAllTags(): Promise<string[]> {
    const url = urlPrefix + `/api/v1/intern/feedback/tags`
    const options = {
        method: 'GET',
    }

    try {
        const { response } = await fetchMedRequestId(url, options)
        if (!response.ok) {
            return response.json()
        }
        // Handle success
    } catch (error) {
        if (error instanceof FetchError) {
            // Handle FetchError
        } else {
            // Handle other errors
        }
    }
    return []
}

async function addTag2(tag: string, id: string): Promise<void> {
    const url = urlPrefix + `/api/v1/intern/feedback/${id}/tags`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
    }

    try {
        const { response } = await fetchMedRequestId(url, options)
        if (!response.ok) {
            // Handle non-OK responses here
        }
        // Handle success
    } catch (error) {
        if (error instanceof FetchError) {
            // Handle FetchError
        } else {
            // Handle other errors
        }
    }
}

const getFilteredTags = (allTags: string[] | undefined, selectedTags: string[] | undefined): string[] => {
    if (!allTags || !selectedTags) return []

    const selectedSet = new Set(selectedTags)
    return allTags.filter((tag) => !selectedSet.has(tag))
}

const deleteTag = async (tag: string, id: string): Promise<void> => {
    await fetch(urlPrefix + `/api/v1/intern/feedback/${id}/tags?tag=${encodeURIComponent(tag)}`, {
        method: 'DELETE',
    })
}
export const Tags = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const queryClient = useQueryClient()
    const feedbackId = feedback.id

    const { data: allTags, isError: isErrorAllTags } = useQuery(['allTags'], fetchAllTags) // ,

    const addTagMutation = useMutation({
        mutationFn: ({ tag, id }: { tag: string; id: string }) => addTag2(tag, id),
        onSuccess: () => {
            queryClient.invalidateQueries()
        },
    })

    const deleteTagMutation = useMutation((tag: string) => deleteTag(tag, feedbackId), {
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries()
            // queryClient.invalidateQueries(['allTags'])
        },
    })
    // Handle tag toggle
    const handleTagToggle = (tag: string, isSelected: boolean): void => {
        if (isSelected && feedbackId) {
            addTagMutation.mutate({ tag: tag, id: feedbackId })
        } else {
            deleteTagMutation.mutate(tag)
        }
    }

    const filteredTags = getFilteredTags(allTags, feedback.tags)

    // if (isLoadingAllTags) return <div>Laster data...</div> // vi trenger kanskje ikke denne, det er inne i combox elementet dataene vil synes uansett
    if (isErrorAllTags) return <div>Det har skjedd en feil</div>
    return (
        <div>
            {JSON.stringify(feedback)}
            <UNSAFE_Combobox
                allowNewValues
                isMultiSelect
                label="Tags:"
                options={filteredTags || []}
                selectedOptions={feedback.tags || []}
                onToggleSelected={(option, isSelected) => {
                    handleTagToggle(option, isSelected)
                }}
            />
        </div>
    )
}
