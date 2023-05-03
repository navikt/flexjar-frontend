import { Alert, Button, Table } from '@navikt/ds-react'
import React from 'react'
import dayjs from 'dayjs'

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

    const sortertData = data?.sort((a, b) => {
        return new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime()
    })

    return (
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Feedback</Table.HeaderCell>
                    <Table.HeaderCell scope="col">App</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Id</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
                    <Table.HeaderCell scope="col"></Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {sortertData?.map((feedback) => (
                    <Table.Row key={feedback.id}>
                        <Table.DataCell className={'w-1/2'}>{feedback.feedback.feedback}</Table.DataCell>
                        <Table.DataCell>{feedback.feedback.app}</Table.DataCell>
                        <Table.DataCell>{feedback.feedback.feedbackId}</Table.DataCell>
                        <Table.DataCell>{dayjs(feedback.opprettet).format('DD-MM-YYYY')}</Table.DataCell>
                        <Table.DataCell>
                            <Button size={'small'} variant={'danger'}>
                                Slett
                            </Button>
                        </Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    )
}
