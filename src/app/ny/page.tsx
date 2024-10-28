import React, { ReactElement, Suspense } from 'react'
import { Skeleton } from '@navikt/ds-react'

import { FeedbackTabell } from '../../components/FeedbackTabell'

function Page(): ReactElement {
    return (
        <>
            <Suspense fallback={<Skeleton variant="rounded" height="100%" width="100%" className="p-4" />}>
                <FeedbackTabell />
            </Suspense>
        </>
    )
}

export default Page
