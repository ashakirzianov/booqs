import { fetchAuthData } from '@/data/auth'
import { AccountData } from '@/core'

export type GetResponse = {
    user: AccountData | null,
}
export async function GET(_request: Request) {
    const user = await fetchAuthData()
    if (!user) {
        return Response.json({
            user: null,
        } satisfies GetResponse)
    }

    const response: GetResponse = {
        user,
    }
    return Response.json(response)
}
