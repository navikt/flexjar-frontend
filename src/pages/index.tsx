import { ContentContainer, Heading } from '@navikt/ds-react'
import React from 'react'

import { beskyttetSide } from '../auth/beskyttetSide'

const Index = (): JSX.Element => {
    return (
        <>
            <ContentContainer>
                <Heading size="xlarge" level="1">
                    Flexjar 💪
                </Heading>
            </ContentContainer>
        </>
    )
}

export const getServerSideProps = beskyttetSide

export default Index
