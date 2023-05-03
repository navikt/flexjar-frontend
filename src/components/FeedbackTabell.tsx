import { Alert, Table } from '@navikt/ds-react'
import React from 'react'

import { UseFeedback } from '../queryhooks/useFeedback'

export const FeedbackTabell = (): JSX.Element => {
    const { data, error } = UseFeedback()

    if (error) {
        return (
            <Alert variant={'error'} className={'mb-8'}>
                Noe gikk galt
            </Alert>
        )
    }

    return (
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Feedback</Table.HeaderCell>
                    <Table.HeaderCell scope="col">App.</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Tidspunkt</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data?.map((feedback) => (
                    <Table.Row key={feedback.id}>
                        <Table.DataCell>{feedback.feedback.feedback}</Table.DataCell>
                        <Table.DataCell>{feedback.feedback.app}</Table.DataCell>
                        <Table.DataCell>{feedback.opprettet}</Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    )
}
