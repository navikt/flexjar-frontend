// import { json } from 'stream/consumers'
import React, { useEffect, useState } from 'react'
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
        return response.json()
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
    const [componentTags, setComponentTags] = useState<string[]>(feedback.tags || [])
    const [filteredTags, setFilteredTags] = useState<string[]>([])
    const queryClient = useQueryClient()
    const feedbackId = feedback.id

    const { data: allTags, isError: isErrorAllTags } = useQuery(['allTags'], fetchAllTags) // ,

    const addTagMutation = useMutation({
        onMutate: async ({ tag }) => {
            setComponentTags([...componentTags, tag])
        },
        mutationFn: ({ tag, id }: { tag: string; id: string }) => addTag2(tag, id),
        onError: () => {
            queryClient.invalidateQueries()
        },
        onSuccess: () => {
            // queryClient.invalidateQueries(['allTags'])
            queryClient.invalidateQueries(['allTags'])
        },
    })

    const deleteTagMutation = useMutation((tag: string) => deleteTag(tag, feedbackId), {
        onMutate: async (tag) => {
            setComponentTags((old) => old?.filter((t) => t !== tag) || [])

            // await queryClient.cancelQueries(['allTags'])
            // const currentTagState = queryClient.getQueryData(['feedback-pagable'])
            // // eslint-disable-next-line
            // console.log(currentTagState)
            //
            // const previousTags = queryClient.getQueryData<string[]>(['allTags'])
            // queryClient.setQueryData<string[]>(['allTags'], (old) => old?.filter((t) => t !== tag))
            //
            // return { previousTags: previousTags || [] }
        },
        onError: () => {
            queryClient.invalidateQueries()

            // Invalidate and refetch
            // queryClient.invalidateQueries()
            // queryClient.invalidateQueries(['allTags'])
        },
        onSuccess: () => {
            // queryClient.invalidateQueries()
            queryClient.invalidateQueries(['allTags'])
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

    useEffect(() => {
        setFilteredTags(getFilteredTags(allTags, componentTags))
    }, [allTags, componentTags])

    // if (isLoadingAllTags) return <div>Laster data...</div> // vi trenger kanskje ikke denne, det er inne i combox elementet dataene vil synes uansett
    if (isErrorAllTags) return <div>Det har skjedd en feil</div>
    return (
        <div>
            {JSON.stringify(feedback)}
            <div>tags</div>
            <div>{JSON.stringify(allTags)}</div>
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
