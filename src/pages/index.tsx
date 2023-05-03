import { ContentContainer, Heading } from '@navikt/ds-react'
import React from 'react'

import { initialProps } from '../initialprops/initialProps'

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

export const getServerSideProps = initialProps

export default Index
