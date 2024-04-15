import '../style/global.css'

import type { AppProps } from 'next/app'
import React, { useState } from 'react'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InternalHeader } from '@navikt/ds-react'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        /* Setting this to true causes the request to be immediately executed after initial
                           mount Even if the query had data hydrated from the server side render */
                        refetchOnMount: false,
                        refetchOnWindowFocus: false,
                    },
                },
            }),
    )

    return (
        <>
            <Head>
                <title>Flexjar</title>
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            </Head>
            <QueryClientProvider client={queryClient}>
                <InternalHeader>
                    <InternalHeader.Title as="h1">
                        Flexjar
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="inline" src="/static/flexjar.png" alt="flexjarlogo" width={100} height={100} />
                    </InternalHeader.Title>
                </InternalHeader>
                <div id="root" className="mx-auto p-4 pb-32">
                    <Component {...pageProps} />
                </div>
            </QueryClientProvider>
        </>
    )
}

export default MyApp
