import '../style/global.css'

import type { AppProps } from 'next/app'
import React from 'react'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <>
            <Head>
                <title>Flexjar</title>
                <meta name="robots" content="noindex" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div id="root" className="mx-auto max-w-2xl p-4 pb-32">
                <Component {...pageProps} />
            </div>
        </>
    )
}

export default MyApp
