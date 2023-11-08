import React from 'react'

import { initialProps } from '../initialprops/initialProps'
import { Tilbakemelding } from '../components/Tilbakemelding'
import { FeedbackTabellRedesign } from '../components/FeedbackTabellRedesign'

const Index = (): JSX.Element => {
    return (
        <>
            <FeedbackTabellRedesign />
            <Tilbakemelding />
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
