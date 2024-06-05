import React from 'react'
import { UNSAFE_Combobox } from '@navikt/ds-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchMedRequestId } from '../utils/fetch'
import { PageResponse } from '../testdata/testdata'
import {fetchAllTags} from "../utils/apiCalls";

export async function addTag(tag: string, id: string): Promise<void> {
    const url = `/api/flexjar-backend/api/v1/intern/feedback/${id}/tags`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tag }),
    }
    await fetchMedRequestId(url, options)
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
    const allTagsSomArray = Array.from(allTags || [])
    const allTagsUtenStjerne = (allTagsSomArray?.filter((x) => x !== 'stjerne') || []).sort()

    const addTagMutation = useMutation({
        mutationFn: ({ tag, id }: { tag: string; id: string }) => addTag(tag, id),
        onMutate: async ({ tag, id }) => {
            const queriesData = queryClient.getQueriesData<PageResponse>({ queryKey: ['feedback'] })
            const querydata = queriesData.find((a) => {
                return a[1]?.content.find((b) => {
                    if (b.id === id) {
                        b.tags.push(tag)
                        return true
                    }
                    return false
                })
            })
            if (querydata) {
                queryClient.setQueryData<PageResponse>(querydata[0], querydata[1])
            }
            if (allTags) {
                allTags?.add(tag)
                queryClient.setQueryData(['allTags'], allTags)
            }
        },
        onError: () => {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
        },
    })

    const deleteTagMutation = useMutation({
        mutationFn: async (tag: string) => await deleteTag(tag, feedbackId),
        onMutate: async (tag) => {
            const queriesData = queryClient.getQueriesData<PageResponse>({ queryKey: ['feedback'] })
            const querydata = queriesData.find((a) => {
                return a[1]?.content.find((b) => {
                    if (b.id === feedbackId) {
                        b.tags = b.tags.filter((x) => x !== tag)
                        return true
                    }
                    return false
                })
            })
            if (querydata) {
                queryClient.setQueryData<PageResponse>(querydata[0], querydata[1])
            }
        },
        onError: () => {
            alert('Det har skjedd en feil, dine siste endringer ble ikke lagret')
            queryClient.invalidateQueries()
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
    )
}
