import { AccountData, getCurrentUser } from '@/data/user'

export type GetResponse = {
    user: AccountData | null,
}
export async function GET(_request: Request) {
    const user = await getCurrentUser()
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
