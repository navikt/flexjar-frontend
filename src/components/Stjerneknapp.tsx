import { BodyLong, Button, Modal } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchMedRequestId } from '../utils/fetch'

export const Stjerneknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    async function addTag(tag: string, id: string): Promise<void> {
        const url = `/api/flexjar-backend/api/flexjar-backend/api/v1/intern/feedback/${id}/tags`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tag }),
        }
        fetchMedRequestId(url, options)
    }

    return (
        <>
            <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
                Slett
            </Button>
            <Modal className="w-4/12" open={open} aria-label="Modal demo" aria-labelledby="modal-heading">
                <Modal.Body>
                    <BodyLong spacing>Er du sikker på at du vil slette denne feedbacken?</BodyLong>
                    <BodyLong className="italic">{feedback.feedback.feedback}</BodyLong>
                    <div className="flex justify-between pt-8">
                        <Button
                            onClick={async () => {
                                await addTag('*', feedback.id)
                                await queryClient.invalidateQueries()
                            }}
                            variant="danger"
                        >
                            *
                        </Button>
                        <Button onClick={() => setOpen(false)}>NEI</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
