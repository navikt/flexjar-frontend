import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function UseFeedback(refetchEvery30Seconds = false): UseQueryResult<Feedback[], Error> {
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'

    return useQuery<Feedback[], Error>({
        queryKey: [`feedback-${selectedTeam}`],
        queryFn: () => fetchJsonMedRequestId(`/api/flexjar-backend/api/v1/intern/feedback?team=${team ?? 'flex'}`),
        refetchInterval: refetchEvery30Seconds ? 30 * 1000 : undefined,
    })
}

export interface Feedback {
    feedback: FeedbackInput
    id: string
    opprettet: string
}

export type FeedbackInput = {
    feedback?: string
    svar?: string
    app: string
    feedbackId: string
} & Record<string, string>
