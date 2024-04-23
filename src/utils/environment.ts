import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export function isMockBackend(): boolean {
    return publicRuntimeConfig.mockBackend === 'true'
}
export function isLocalBackend(): boolean {
    return publicRuntimeConfig.localBackend === 'true'
}
