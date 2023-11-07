import { Alert, BodyShort, CopyButton, Pagination, Select, Table } from '@navikt/ds-react'
import React from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { Feedback, useFeedback } from '../queryhooks/useFeedback'

export const FeedbackTabellRedesign = (): JSX.Element | null => {
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'

    const router = useRouter()
    const { data, error } = useFeedback(selectedTeam)

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
            cell: (info) => {
                return <BodyShort>{info.getValue().feedback.app}</BodyShort>
            },
            header: () => 'App',
            footer: (info) => info.column.id,
        }),
    ]
    const table = useReactTable({
        data: data || [],
        columns,
        // Pipeline
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        //
        debugTable: true,
    })

    if (!data) {
        return null
    }
    if (error) {
        return (
            <Alert variant="error" className="mb-8">
                Noe gikk galt
            </Alert>
        )
    }

    return (
        <>
            <div className="flex justify-between items-center h-16 mb-4">
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

            <div className="p-2">
                <div className="h-2" />
                <Table>
                    <Table.Header>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Row key={headerGroup.id}>
                                <Table.HeaderCell />
                                {headerGroup.headers.map((header) => (
                                    <Table.HeaderCell key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </Table.HeaderCell>
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
        </>
    )
}
