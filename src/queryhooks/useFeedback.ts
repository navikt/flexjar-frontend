import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useFeedback(team: string | string[], refetchEvery30Seconds = false): UseQueryResult<Feedback[], Error> {
    return useQuery<Feedback[], Error>({
        queryKey: [`feedback-${team}`],
        queryFn: async () => {
            const fetchet: Feedback[] = await fetchJsonMedRequestId(
                `/api/flexjar-backend/api/v1/intern/feedback?team=${team}`,
            )
            fetchet.sort((a, b) => {
                return new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime()
            })
            return fetchet
        },

        refetchInterval: refetchEvery30Seconds ? 30 * 1000 : undefined,
    })
}

export interface Feedback {
    feedback: FeedbackInput
    id: string
    opprettet: string
    tags: string[]
}

export type FeedbackInput = {
    feedback?: string
    svar?: string
    app: string
    feedbackId: string
} & Record<string, string>
