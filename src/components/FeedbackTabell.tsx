import { Alert, BodyShort, CopyButton, Pagination, Select, Switch, Table, TextField } from '@navikt/ds-react'
import React, { useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchJsonMedRequestId } from '../utils/fetch'
import { PageResponse } from '../testdata/testdata'

import { DeleknappSlack, DeleknappTrello } from './Deleknapp'
import { Sletteknapp } from './Sletteknapp'
import { Tags } from './Tags'

export const FeedbackTabell = (): JSX.Element | null => {
    const { team } = useRouter().query
    const selectedTeam = team ?? 'flex'
    const [medTekst, setMedTekst] = useState(true)
    const [fritekstInput, setFritekstInput] = useState('')
    const [fritekst, setFritekst] = useState('')

    const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const router = useRouter()
    const { data, error } = useQuery<PageResponse, Error>({
        queryKey: [`feedback-pagable`, team, pageIndex, pageSize, medTekst, fritekst],
        queryFn: async () => {
            let url = `/api/flexjar-backend/api/v1/intern/feedback-pagable?team=${selectedTeam}&page=${pageIndex}&size=${pageSize}&medTekst=${medTekst}`
            if (fritekst) {
                url += `&fritekst=${fritekst}`
            }
            const fetchet: PageResponse = await fetchJsonMedRequestId(url)
            return fetchet
        },
        keepPreviousData: false,
    })
    const defaultData = React.useMemo(() => [], [])

    const columnHelper = createColumnHelper<Feedback>()

    const pagination = React.useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize],
    )

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
            cell: (info) => {
                function svarTilEmoji(): string | undefined {
                    const feedback = info.getValue().feedback
                    const svar = feedback.svar
                    if (feedback.feedbackId !== 'sykepengesoknad-kvittering') {
                        return svar
                    }
                    if (svar == '1') {
                        // sinna
                        return '😡'
                    }
                    if (svar == '2') {
                        // lei
                        return '🙁'
                    }
                    if (svar == '3') {
                        // nøytral
                        return '😐'
                    }
                    if (svar == '4') {
                        // glad
                        return '😀'
                    }
                    if (svar == '5') {
                        // hjerteøye
                        return '😍'
                    }
                    return svar
                }

                return (
                    <BodyShort>
                        <span className="font-bold">{svarTilEmoji()}: </span>
                        <span className="italic">{info.getValue().feedback.feedback}</span>
                    </BodyShort>
                )
            },
            header: () => 'Feedback',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'kopier',
            cell: (info) => <CopyButton copyText={info.getValue().feedback.feedback ?? ''} variant="action" />,
            header: () => '',
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
        columnHelper.accessor((row) => row, {
            id: 'slack',
            cell: (info) => {
                const feedback = info.getValue()
                if (feedback.feedback.feedback?.trim() === '') return null
                return <DeleknappSlack feedback={feedback} />
            },
            header: () => '',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'trello',
            cell: (info) => {
                const feedback = info.getValue()
                if (feedback.feedback.feedback?.trim() === '') return null
                if (selectedTeam !== 'teamsykmelding') return null
                return <DeleknappTrello feedback={feedback} />
            },
            header: () => '',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'slett',
            cell: (info) => {
                const feedback = info.getValue()
                return <Sletteknapp feedback={feedback} />
            },
            header: () => '',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'tags',
            cell: (info) => {
                const feedback = info.getValue()

                return (
                    <>
                        {' '}
                        {JSON.stringify(info.getValue())} <Tags feedback={feedback} />{' '}
                    </>
                )
            },
            header: () => '',
            footer: (info) => info.column.id,
        }),
    ]
    const table = useReactTable({
        data: data?.content ?? defaultData,
        columns,
        // Pipeline
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        pageCount: data?.totalPages ?? -1,
        manualPagination: true,

        state: {
            pagination,
        },

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
                <div className="flex gap-4 items-end">
                    <TextField
                        label="Søk"
                        size="small"
                        value={fritekstInput}
                        onChange={(e) => {
                            setFritekstInput(e.target.value)
                        }}
                        onKeyUp={(e) => {
                            if (e.key === 'Enter') {
                                setFritekst(fritekstInput)
                            }
                        }}
                    />
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
                        <option value="tbd">TBD</option>
                    </Select>
                    <div className="self-end">
                        <Switch checked={medTekst} onChange={() => setMedTekst((b) => !b)} size="small">
                            Vis bare feedback med tekst
                        </Switch>
                    </div>
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
