import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function UseFeedback(): UseQueryResult<Feedback[], Error> {
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'

    return useQuery<Feedback[], Error>({
        queryKey: [`feedback-${selectedTeam}`],
        queryFn: () => fetchJsonMedRequestId(`/api/flexjar-backend/api/v1/intern/feedback?team=${team ?? 'flex'}`),
    })
}

export interface Feedback {
    feedback: FeedbackInput
    id: string
    opprettet: string
}

export interface FeedbackInput {
    feedback?: string
    svar?: string
    app: string
    feedbackId: string
}
