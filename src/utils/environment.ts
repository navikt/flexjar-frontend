export function isMockBackend(): boolean {
    return process.env.MOCK_BACKEND === 'true'
}
export function isLocalBackend(): boolean {
    return process.env.LOCAL_BACKEND === 'true'
}
