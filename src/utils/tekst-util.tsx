import React from 'react'

export function flervalgSvar(svar?: string | null): React.ReactElement | null {
    if (!svar) return null
    let svarObjekt: { hovedvalg: string; undervalg: string } | undefined
    try {
        let jsonStr = svar
        if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
            jsonStr = jsonStr.slice(1, -1)
        }
        if (jsonStr.includes('\\"')) {
            jsonStr = jsonStr.replace(/\\"/g, '"')
        }
        if (jsonStr.includes('"')) {
            jsonStr = jsonStr.replace(/"/g, '"')
        }
        svarObjekt = JSON.parse(jsonStr)
    } catch {
        svarObjekt = undefined
    }
    if (svarObjekt) {
        return (
            <>
                <b>Hovedvalg</b>: {svarObjekt.hovedvalg}, <b>undervalg</b>: {svarObjekt.undervalg}
            </>
        )
    } else return null
}
