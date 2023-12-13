import {
    Alert,
    BodyShort,
    Button,
    CopyButton,
    Pagination,
    Select,
    Skeleton,
    Switch,
    Table,
    TextField,
} from '@navikt/ds-react'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { parseAsBoolean, parseAsInteger, parseAsString, useQueryState } from 'next-usequerystate'
import { StarIcon } from '@navikt/aksel-icons'

import { Feedback } from '../queryhooks/useFeedback'
import { fetchJsonMedRequestId } from '../utils/fetch'
import { PageResponse } from '../testdata/testdata'

import { DeleknappSlack, DeleknappTrello } from './Deleknapp'
import { Sletteknapp } from './Sletteknapp'
import { Tags } from './Tags'
import { Stjerneknapp } from './Stjerneknapp'

export const FeedbackTabell = (): React.JSX.Element | null => {
    const [team, setTeam] = useQueryState('team', parseAsString.withDefault('flex'))
    const [medTekst, setMedTekst] = useQueryState('medTekst', parseAsBoolean.withDefault(true))
    const [fritekstInput, setFritekstInput] = useQueryState('fritekst', parseAsString.withDefault(''))
    const [fritekst, setFritekst] = useState(fritekstInput)
    const [stjerne, setStjerne] = useQueryState('stjerne', parseAsBoolean.withDefault(false))

    const [page, setPage] = useQueryState('page', parseAsString.withDefault('nyeste'))
    const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(10))

    const { data, error, isFetching } = useQuery<PageResponse, Error>({
        queryKey: [`feedback`, team, page, size, medTekst, fritekst, stjerne],
        queryFn: async () => {
            let url = `/api/flexjar-backend/api/v1/intern/feedback?team=${team}&size=${size}&medTekst=${medTekst}`
            if (fritekst) {
                url += `&fritekst=${fritekst}`
            }
            if (page != 'nyeste') {
                url += `&page=${Number(page) - 1}`
            }
            if (stjerne) {
                url += `&stjerne=true`
            }
            const fetchet: PageResponse = await fetchJsonMedRequestId(url)
            return fetchet
        },
        placeholderData: keepPreviousData,
    })
    const defaultData = React.useMemo(() => [], [])

    const columnHelper = createColumnHelper<Feedback>()

    const columns = [
        columnHelper.accessor('opprettet', {
            cell: (info) => {
                return (
                    <BodyShort as={isFetching ? Skeleton : 'p'}>
                        {dayjs(info.getValue()).format('YYYY.MM.DD')}
                    </BodyShort>
                )
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
                    <BodyShort as={isFetching ? Skeleton : 'p'}>
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
                return <BodyShort as={isFetching ? Skeleton : 'p'}>{info.getValue().feedback.app}</BodyShort>
            },
            header: () => 'App',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'slack',
            cell: (info) => {
                const feedback = info.getValue()
                if (feedback.feedback.feedback?.trim() === '') return null
                return <DeleknappSlack selectedTeam={team} feedback={feedback} />
            },
            header: () => '',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'trello',
            cell: (info) => {
                const feedback = info.getValue()
                if (feedback.feedback.feedback?.trim() === '') return null
                if (team !== 'teamsykmelding') return null

                return <DeleknappTrello selectedTeam={team} feedback={feedback} />
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
            id: 'star',
            cell: (info) => {
                const feedback = info.getValue()

                return <Stjerneknapp feedback={feedback} />
            },
            header: () => '',
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor((row) => row, {
            id: 'tags',
            cell: (info) => {
                const feedback = info.getValue()

                return <Tags feedback={feedback} />
            },
            header: () => 'Tags',
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
        pageCount: data?.totalPages ?? -1,
        manualPagination: true,
        //
        debugTable: true,
    })

    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Avbryt eksisterende timeout
        if (timeoutId) clearTimeout(timeoutId)

        // Opprett en ny timeout
        const newTimeoutId = setTimeout(() => {
            setFritekst(fritekstInput)
            setPage('nyeste')
        }, 500) // 2 sekunder

        setTimeoutId(newTimeoutId)

        // Rengjøringsfunksjon
        return () => clearTimeout(newTimeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fritekstInput])

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
                                setPage('nyeste')
                            }
                        }}
                    />
                    <Select
                        label="Velg team"
                        size="small"
                        defaultValue={team}
                        onChange={(event) => {
                            setTeam(event.target.value)
                        }}
                    >
                        <option value="flex">Flex</option>
                        <option value="teamsykmelding">Team Sykmelding</option>
                        <option value="helsearbeidsgiver">Team HAG</option>
                        <option value="tbd">TBD</option>
                        <option value="teamsykefravr">iSYFO</option>
                    </Select>
                    <div className="self-end">
                        <Switch checked={medTekst} onChange={() => setMedTekst((b) => !b)} size="small">
                            Vis bare feedback med tekst
                        </Switch>
                    </div>
                    <Button
                        size="small"
                        onClick={() => {
                            setStjerne(!stjerne)
                            setPage('nyeste')
                        }}
                        variant={stjerne ? 'primary' : 'secondary'}
                    >
                        <StarIcon title="a11y-stjerne" fontSize="1.5rem" className={stjerne ? 'text-white' : ''} />
                    </Button>
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
                    page={data.number + 1}
                    onPageChange={(p) => {
                        // do nothing
                        setPage(p + '')
                    }}
                    count={data.totalPages}
                    size="small"
                />

                <Select
                    className="w-36"
                    label=""
                    value={size}
                    onChange={(e) => {
                        setSize(Number(e.target.value))
                    }}
                >
                    {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </Select>
            </div>
        </>
    )
}
