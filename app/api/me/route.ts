import { userForId, DbUser } from '@/backend/users'
import { getUserIdInsideRequest } from '@/data/auth'

export type GetResponse = {
    user: DbUser | null,
}
export async function GET(_request: Request) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({
            user: null,
        } satisfies GetResponse)
    }
    const user = await userForId(userId)
    if (!user) {
        return new Response('User not found', {
            status: 404,
        })
    }
    const response: GetResponse = {
        user,
    }
    return Response.json(response)
}
