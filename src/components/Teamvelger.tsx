import React, { ReactElement } from 'react'
import { Select } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'
import { parseAsString, useQueryState } from 'next-usequerystate'

import { fetchJsonMedRequestId } from '../utils/fetch'

type Props = {
    onChange: (team: string) => void
}

type TeamResponse = Record<string, string[]>

function Teamvelger({ onChange }: Props): ReactElement {
    const [selectedApp, setSelectedApp] = useQueryState('app', parseAsString.withDefault('alle'))
    const [selectedTeam, setSelecedTeam] = useQueryState('team', parseAsString.withDefault('flex'))
    const teamOgApper = useQuery<TeamResponse, Error>({
        queryKey: [`team-med-apper`],
        queryFn: async () => await fetchJsonMedRequestId(`/api/flexjar-backend/api/v1/intern/feedback/teams`),
    })
    const apperForValgtTeam = teamOgApper.data?.[selectedTeam] ?? []

    return (
        <>
            <Select
                label="Velg team"
                size="small"
                defaultValue={selectedTeam}
                onChange={async (event) => {
                    setSelecedTeam(event.target.value)
                    if (selectedTeam !== event.target.value) {
                        setSelectedApp(null)
                    }
                    onChange(event.target.value)
                }}
            >
                <option value={selectedApp}>{pentTeamNavn(selectedTeam)}</option>
                {teamOgApper.data &&
                    Object.keys(teamOgApper.data)
                        .filter((it) => it !== selectedTeam)
                        .map((team) => (
                            <option key={team} value={team}>
                                {pentTeamNavn(team)}
                            </option>
                        ))}
            </Select>
            <Select
                label="App"
                size="small"
                defaultValue={selectedTeam}
                onChange={async (event) => {
                    setSelectedApp(event.target.value)
                    onChange(event.target.value)
                }}
            >
                <option value="alle">Alle apper</option>
                {apperForValgtTeam.map((app) => (
                    <option key={app} value={app}>
                        {app}
                    </option>
                ))}
            </Select>
        </>
    )
}

function pentTeamNavn(team: string): string {
    switch (team) {
        case 'flex':
            return 'Flex'
        case 'teamsykmelding':
            return 'Team Sykmelding'
        case 'helsearbeidsgiver':
            return 'Team HAG'
        case 'tbd':
            return 'TBD'
        case 'teamsykefravr':
            return 'iSYFO'
        default:
            return team
    }
}

export default Teamvelger
