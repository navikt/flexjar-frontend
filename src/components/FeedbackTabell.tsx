import { Accordion, Alert, Switch, Table } from '@navikt/ds-react'
import React, { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import MUIDataTable from 'mui-datatables'

import { Feedback, UseFeedback } from '../queryhooks/useFeedback'

import { Sletteknapp } from './Sletteknapp'

export const FeedbackTabell = (): JSX.Element | null => {
    const { data, error } = UseFeedback()
    const [alt, setAlt] = useState(true)

    if (error) {
        return (
            <Alert variant={'error'} className={'mb-8'}>
                Noe gikk galt
            </Alert>
        )
    }
    if (!data) {
        return null
    }

    const tabellData = data
        .sort((a, b) => {
            return new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime()
        })
        ?.filter((feedback) => {
            return alt ? feedback.feedback.feedback?.trim() : true
        })
        .map((a) => {
            return [dayjs(a.opprettet), a.feedback.feedback, a.feedback.app, a.feedback.svar, a]
        })

    return (
        <>
            <Switch checked={alt} onChange={() => setAlt(!alt)}>
                Vis bare feedback med tekst
            </Switch>
            <MUIDataTable
                title={'Aktiviteter'}
                data={tabellData}
                options={{
                    selectableRows: 'none',
                    print: false,
                    customSearch: (searchQuery: string, currentRow: string[]) => {
                        return JSON.stringify(currentRow[4]).toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
                    },
                }}
                columns={[
                    {
                        name: 'Dato',
                        options: {
                            customBodyRenderLite: (dataIndex: number) => {
                                const dato = tabellData[dataIndex][0] as Dayjs
                                return dato.format('YYYY.MM.DD')
                            },

                            filter: true,
                            filterType: 'dropdown',
                            filterOptions: {
                                names: ['Siste 7 dager', 'I dag', 'Siste 14 dager'],
                                logic(dag, filterVal) {
                                    let dato = dayjs().subtract(30, 'years')
                                    if (filterVal.indexOf('Siste 7 dager') >= 0) {
                                        dato = dayjs().subtract(7, 'day')
                                    }
                                    if (filterVal.indexOf('I dag') >= 0) {
                                        dato = dayjs().startOf('day')
                                    }
                                    if (filterVal.indexOf('Siste 14 dager') >= 0) {
                                        dato = dayjs().subtract(14, 'day')
                                    }

                                    // eslint-disable-next-line
                                    return (dag as any as Dayjs).isBefore(dato)
                                },
                            },
                            sort: false,
                        },
                    },
                    {
                        name: 'Feedback',
                        options: {
                            filter: false,
                            customBodyRenderLite: (dataIndex: number) => {
                                const feedback = tabellData[dataIndex][4] as Feedback
                                return (
                                    <Accordion.Item key={feedback.id}>
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
                                )
                            },
                        },
                    },
                    { name: 'App' },
                    { name: 'Svar' },
                    {
                        name: 'Slett',
                        options: {
                            filter: false,
                            customBodyRenderLite: (dataIndex: number) => {
                                const feedback = tabellData[dataIndex][4] as Feedback
                                return <Sletteknapp feedback={feedback} />
                            },
                        },
                    },
                ]}
            />
        </>
    )
}
