import { Accordion, Alert, Switch, Table, Select, CopyButton, BodyShort, Pagination } from '@navikt/ds-react'
import React, { useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import MUIDataTable from 'mui-datatables'
import { useRouter } from 'next/router'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'

import { Feedback, useFeedback } from '../queryhooks/useFeedback'

import { Sletteknapp } from './Sletteknapp'
import { DeleknappSlack, DeleknappTrello } from './Deleknapp'

export const FeedbackTabell = (): JSX.Element | null => {
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'

    const router = useRouter()
    const [alt, setAlt] = useState(true)
    const [polling, setPolling] = useState(false)
    const [tanstackTable, setTanstackTable] = useState(false)
    const { data, error } = useFeedback(selectedTeam, polling)

    if (error) {
        return (
            <Alert variant="error" className="mb-8">
                Noe gikk galt
            </Alert>
        )
    }
    if (!data) {
        return null
    }

    const tabellData = data

        ?.filter((feedback) => {
            return alt ? feedback.feedback.feedback?.trim() : true
        })
        .map(
            (a) =>
                [
                    dayjs(a.opprettet),
                    a.feedback.feedback,
                    a.feedback.feedback,
                    a.feedback.app,
                    a.feedback.svar,
                    a.feedback.feedback,
                    a,
                ] as const,
        )

    return (
        <>
            <div className="flex justify-between items-center h-16 mb-4">
                <div className="flex gap-4">
                    <Switch checked={alt} onChange={() => setAlt((b) => !b)} size="small">
                        Vis bare feedback med tekst
                    </Switch>
                    <Switch checked={polling} onChange={() => setPolling((b) => !b)} size="small">
                        Hent nye hvert 30. sekund
                    </Switch>
                    <Switch checked={tanstackTable} onChange={() => setTanstackTable((b) => !b)} size="small">
                        Tanstack table
                    </Switch>
                </div>
                <div>
                    <Select
                        label="Velg team"
                        size="small"
                        defaultValue={router.query.team ?? 'flex'}
                        onChange={(event) => {
                            router.push('/?team=' + event.target.value)
                        }}
                    >
                        <option value="flex">Flex</option>
                        <option value="teamsykmelding">Team Sykmelding</option>
                        <option value="helsearbeidsgiver">Team HAG</option>
                    </Select>
                </div>
            </div>
            {!tanstackTable && (
                <MUIDataTable
                    title="Aktiviteter"
                    data={tabellData}
                    options={{
                        selectableRows: 'none',
                        print: false,
                        customSearch: (searchQuery: string, currentRow: string[]) => {
                            return JSON.stringify(currentRow[6]).toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0
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
                                    const feedback = tabellData[dataIndex][6] as Feedback
                                    return (
                                        <Accordion.Item key={feedback.id}>
                                            <Accordion>
                                                <Accordion.Header className="border-0">
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
                        {
                            name: 'Kopier',
                            options: {
                                draggable: false,
                                sort: false,
                                filter: false,
                                customBodyRenderLite: (dataIndex: number) => {
                                    const feedback = tabellData[dataIndex][6]
                                    return <CopyButton copyText={feedback.feedback.feedback ?? ''} variant="action" />
                                },
                            },
                        },
                        { name: 'App' },

                        { name: 'Svar' },
                        {
                            name: 'Slett',
                            options: {
                                draggable: false,
                                sort: false,
                                filter: false,
                                customBodyRenderLite: (dataIndex: number) => {
                                    const feedback = tabellData[dataIndex][6]
                                    return <Sletteknapp feedback={feedback} />
                                },
                            },
                        },
                        {
                            name: 'Del',
                            options: {
                                draggable: false,
                                sort: false,
                                filter: false,
                                setCellHeaderProps: () => ({ style: { width: '36px', textAlign: 'center' } }),
                                customBodyRenderLite: (dataIndex: number) => {
                                    const feedback = tabellData[dataIndex][6]

                                    if (feedback.feedback.feedback?.trim() === '') return null

                                    return <DeleknappSlack feedback={feedback} />
                                },
                            },
                        },
                        ...(selectedTeam === 'teamsykmelding'
                            ? [
                                  {
                                      name: 'Trello',
                                      options: {
                                          draggable: false,
                                          sort: false,
                                          filter: false,
                                          setCellHeaderProps: () => ({ style: { width: '36px', textAlign: 'center' } }),
                                          customBodyRenderLite: (dataIndex: number) => {
                                              const feedback = tabellData[dataIndex][6]

                                              if (feedback.feedback.feedback?.trim() === '') return null

                                              return <DeleknappTrello feedback={feedback} />
                                          },
                                      },
                                  },
                              ]
                            : []),
                    ]}
                />
            )}
            {tanstackTable && <TanstackTable data={data}></TanstackTable>}
        </>
    )
}

function TanstackTable({ data }: { data: Feedback[] }): React.JSX.Element {
    const columnHelper = createColumnHelper<Feedback>()

    const columns = [
        columnHelper.accessor('opprettet', {
            cell: (info) => {
                return <BodyShort>{dayjs(info.getValue()).format('YYYY.MM.DD')}</BodyShort>
            },
            header: () => 'Dato',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'feedback',
            cell: (info) => <i>{info.getValue().feedback.feedback}</i>,
            header: () => 'Feedback',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'kopier',
            cell: (info) => <CopyButton copyText={info.getValue().feedback.feedback ?? ''} variant="action" />,
            header: () => 'Kopier',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'app',
            cell: (info) => <i>{info.getValue().feedback.app}</i>,
            header: () => 'App',
            footer: (info) => info.column.id,
        }),
    ]
    const table = useReactTable({
        data,
        columns,
        // Pipeline
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        //
        debugTable: true,
    })

    return (
        <div className="p-2">
            <div className="h-2" />
            <Table>
                <Table.Header>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Table.Row key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Table.ExpandableRow
                                key={row.id}
                                content={
                                    <Table size="small">
                                        <Table.Body>
                                            {Object.entries(row.original.feedback).map(([key, value]) => (
                                                <Table.Row key={key}>
                                                    <Table.DataCell>{key}</Table.DataCell>
                                                    <Table.DataCell>{`${value}`}</Table.DataCell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                }
                            >
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Table.DataCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.DataCell>
                                    )
                                })}
                            </Table.ExpandableRow>
                        )
                    })}
                </Table.Body>
            </Table>
            <Pagination
                className="mt-4"
                page={table.getState().pagination.pageIndex + 1}
                onPageChange={(p) => {
                    // do nothing
                    table.setPageIndex(p - 1)
                }}
                count={table.getPageCount()}
                size="small"
            />

            <Select
                className="w-36"
                label=""
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                    table.setPageSize(Number(e.target.value))
                }}
            >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                    </option>
                ))}
            </Select>
        </div>
    )
}
