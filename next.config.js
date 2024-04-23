/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
    serverRuntimeConfig: {
        // Will only be available on the server side
        flexjarBackendClientId: process.env.FLEXJAR_BACKEND_CLIENT_ID,
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        mockBackend: process.env.MOCK_BACKEND,
        localBackend: process.env.LOCAL_BACKEND,
    },
}
