import React from 'react'

import { initialProps } from '../initialprops/initialProps'
import { Tilbakemelding } from '../components/Tilbakemelding'
import { FeedbackTabell } from '../components/FeedbackTabell'

const Index = (): JSX.Element => {
    return (
        <>
            <FeedbackTabell />
            <Tilbakemelding />
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
