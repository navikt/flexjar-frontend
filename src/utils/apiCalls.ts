import {fetchJsonMedRequestId} from "./fetch";

export async function fetchAllTags(): Promise<Set<string>> {
    const url = `/api/flexjar-backend/api/v1/intern/feedback/tags`

    const fetchet: string[] = await fetchJsonMedRequestId(url)

    return new Set(fetchet)
}
