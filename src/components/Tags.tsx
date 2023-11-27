// import { json } from 'stream/consumers'

import React from 'react'
import { UNSAFE_Combobox } from '@navikt/ds-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
// import {ur} from "@faker-js/faker";

// const urlPrefix = "http://localhost:8085"
const urlPrefix = '/api/flexjar-backend' // wtf wtf wtf
const fetchAllTags = async (): Promise<string[]> => {
    const response = await fetch(urlPrefix + '/api/v1/intern/feedback/tags/')
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    return response.json()
}

// so this is wrong
const fetchTags = async (id: string): Promise<string[]> => {
    const response = await fetch(urlPrefix + `/api/v1/intern/feedback/${id}/tags`)
    if (!response.ok) {
        throw new Error('Network response was not ok')
    }
    return response.json()
}

async function addTag2(tag: string, id: string): Promise<void> {
    await fetch(urlPrefix + `/api/v1/intern/feedback/${id}/tags`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
    })
}
// const addTag = async (tag: string, id: string): Promise<void> => {
//     console.log('addTag', tag, id)
//     await fetch(urlPrefix + `/api/v1/intern/feedback/${id}/tags`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ tag }),
//     })
// }

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

    const {
        data: selectedTags,
        // isLoading,
        // isError,
    } = useQuery(['selectedTags', feedbackId], () => fetchTags(feedbackId))
    // Fetch all unique tags
    const { data: allTags } = useQuery(['allTags'], fetchAllTags) // , isLoading: isLoadingAllTags, isError: isErrorAllTags

    // Mutation for adding a tag
    // const addTagMutation = useMutation((tag: string) => addTag(tag, feedbackId), {
    //     onSuccess: () => {
    //         // Invalidate and refetch
    //         queryClient.invalidateQueries(['selectedTags', feedbackId])
    //         queryClient.invalidateQueries(['allTags'])
    //     },
    // })

    const deleteTagMutation = useMutation((tag: string) => deleteTag(tag, feedbackId), {
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries(['selectedTags', feedbackId])
            queryClient.invalidateQueries(['allTags'])
        },
    })
    // Handle tag toggle
    const handleTagToggle = (tag: string, isSelected: boolean): void => {
        if (isSelected) {
            //addTagMutation.mutate(tag)

            addTag2(tag, feedbackId)
        } else {
            deleteTagMutation.mutate(tag)
        }
    }
    const filteredTags = getFilteredTags(allTags, selectedTags)
    //
    // if (isLoading || isLoadingAllTags) return <div>Loading...</div>
    // if (isError || isErrorAllTags) return <div>An error has occurred</div>
    return (
        <div>
            {/*{JSON.stringify(feedback)}*/}
            {"feedback.tags: " + JSON.stringify(feedback.tags)}
            {"filtered tags" +  JSON.stringify(filteredTags)}
            {/*{JSON.stringify(selectedTags)}
            {JSON.stringify(filteredTags)}
            {JSON.stringify(allTags)}*/}
            <UNSAFE_Combobox
                allowNewValues
                isMultiSelect
                label="Hva er dine favorittdrikker? Legg gjerne til flere alternativer."
                options={filteredTags || []}
                selectedOptions={feedback.tags || []}
                onToggleSelected={(option, isSelected) => {
                    handleTagToggle(option, isSelected)
                }}
            />
        </div>
    )
}
