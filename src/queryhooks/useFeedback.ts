import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function UseFeedback(): UseQueryResult<Feedback[], Error> {
    return useQuery<Feedback[], Error>({
        queryKey: ['feedback'],
        queryFn: () => fetchJsonMedRequestId('/api/flexjar-backend/api/v1/intern/feedback'),
    })
}

export interface Feedback {
    feedback: {
        feedback: string
        app: string
        feedbackId: string
    }
    id: string
    opprettet: string
}
