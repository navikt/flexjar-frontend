import { Accordion, Alert, Switch, Table } from '@navikt/ds-react'
import React, { useState } from 'react'
import dayjs from 'dayjs'

import { UseFeedback } from '../queryhooks/useFeedback'

import { Sletteknapp } from './Sletteknapp'

export const FeedbackTabell = (): JSX.Element => {
    const { data, error } = UseFeedback()
    const [alt, setAlt] = useState(true)

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
        <>
            <Switch checked={alt} onChange={() => setAlt(!alt)}>
                Vis bare feedback med tekst
            </Switch>
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
                    {sortertData
                        ?.filter((feedback) => {
                            return alt ? feedback.feedback.feedback?.trim() : true
                        })
                        ?.map((feedback) => (
                            <Table.Row key={feedback.id}>
                                <Table.DataCell className={'w-1/2'}>
                                    <Accordion.Item>
                                        <Accordion>
                                            <Accordion.Header className={'border-0'}>
                                                {feedback.feedback.svar + ' '}
                                                {feedback.feedback.feedback?.trim() &&
                                                    ': ' + feedback.feedback.feedback?.trim()}
                                            </Accordion.Header>
                                            <Accordion.Content>
                                                <Table size="small">
                                                    <Table.Body>
                                                        {Object.entries(feedback.feedback).map(([key, value]) => (
                                                            <Table.Row key={key}>
                                                                <Table.DataCell>{key}</Table.DataCell>
                                                                <Table.DataCell>{`${value}`}</Table.DataCell>
                                                            </Table.Row>
                                                        ))}
                                                    </Table.Body>
                                                </Table>
                                            </Accordion.Content>
                                        </Accordion>
                                    </Accordion.Item>
                                </Table.DataCell>
                                <Table.DataCell>{feedback.feedback.app}</Table.DataCell>
                                <Table.DataCell>{feedback.feedback.feedbackId}</Table.DataCell>
                                <Table.DataCell>{dayjs(feedback.opprettet).format('DD-MM-YYYY hh:MM')}</Table.DataCell>
                                <Table.DataCell>
                                    <Sletteknapp feedback={feedback} />
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                </Table.Body>
            </Table>
        </>
    )
}
