import { userForId, accountDataFromDbUser } from '@/backend/users'
import { getUserIdInsideRequest } from '@/data/auth'
import { AccountData } from '@/core'

export type GetResponse = {
    user: AccountData | null,
}
export async function GET(_request: Request) {
    const userId = await getUserIdInsideRequest()
    if (!userId) {
        return Response.json({
            user: null,
        } satisfies GetResponse)
    }
    const dbUser = await userForId(userId)
    if (!dbUser) {
        return new Response('User not found', {
            status: 404,
        })
    }
    
    const user: AccountData = accountDataFromDbUser(dbUser)
    
    const response: GetResponse = {
        user,
    }
    return Response.json(response)
}
