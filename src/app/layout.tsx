import '../style/global.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { InternalHeader, InternalHeaderTitle } from '@navikt/ds-react/InternalHeader'
import Image from 'next/image'

import Providers from './providers'

export const metadata = {
    title: 'Flexjar',
    description: 'Flexjar for PO Helse',
}

export default function RootLayout({ children }: PropsWithChildren): ReactElement {
    return (
        <html lang="nb">
            <head>
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            </head>
            <body>
                <Providers>
                    <InternalHeader>
                        <InternalHeaderTitle as="h1">
                            Flexjar
                            <Image
                                unoptimized
                                className="inline"
                                src="/static/flexjar.png"
                                alt="flexjarlogo"
                                width={100}
                                height={100}
                            />
                        </InternalHeaderTitle>
                    </InternalHeader>
                    <main className="mx-auto p-4 pb-32">{children}</main>
                </Providers>
            </body>
        </html>
    )
}
