import React from 'react'

import { initialProps } from '../initialprops/initialProps'
import { FeedbackTabell } from '../components/FeedbackTabell'

const Index = (): React.JSX.Element => {
    return (
        <>
            <FeedbackTabell />
        </>
    )
}

export const getServerSideProps = initialProps

export default Index
