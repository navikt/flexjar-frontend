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
