import React from 'react'

import { initialProps } from '../initialprops/initialProps'
import { FeedbackTabell } from '../components/FeedbackTabell'
import { Tilbakemelding } from '../components/Tilbakemelding'

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
