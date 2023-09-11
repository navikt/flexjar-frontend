import { BodyLong, Button, Modal } from '@navikt/ds-react'
import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { Feedback } from '../queryhooks/useFeedback'

export const Sletteknapp = ({ feedback }: { feedback: Feedback }): JSX.Element => {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'

    return (
        <>
            <Button size="small" variant="danger" onClick={() => setOpen(true)}>
                Slett
            </Button>
            <Modal className="w-4/12" open={open} aria-label="Modal demo" aria-labelledby="modal-heading">
                <Modal.Body>
                    <BodyLong spacing>Er du sikker på at du vil slette denne feedbacken?</BodyLong>
                    <BodyLong className="italic">{feedback.feedback.feedback}</BodyLong>
                    <div className="flex justify-between pt-8">
                        <Button
                            onClick={async () => {
                                await fetch('/api/flexjar-backend/api/v1/intern/feedback/' + feedback.id, {
                                    method: 'DELETE',
                                })
                                await queryClient.invalidateQueries([`feedback-${selectedTeam}`])

                                setOpen(false)
                            }}
                            variant="danger"
                        >
                            JA
                        </Button>
                        <Button onClick={() => setOpen(false)}>NEI</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}
