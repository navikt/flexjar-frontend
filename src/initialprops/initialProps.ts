import { GetServerSidePropsResult } from 'next'

import { beskyttetSide } from '../auth/beskyttetSide'

export const initialProps = beskyttetSide<PrefetchResults>(async () => {
    return {
        props: {
            tidspunkt: new Date().getDate(),
        },
    }
})

export interface PrefetchResults {
    tidspunkt: number
}

export type GetServerSidePropsPrefetchResult = GetServerSidePropsResult<PrefetchResults>
