import React from 'react'

import { initialProps } from '../initialprops/initialProps'
import { Tilbakemelding } from '../components/Tilbakemelding'
import { FeedbackTabell } from '../components/FeedbackTabell'
import { isMockBackend } from '../utils/environment'

const Index = (): JSX.Element => {
    return (
        <>
            <FeedbackTabell />
            {!isMockBackend() && <Tilbakemelding />}
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
