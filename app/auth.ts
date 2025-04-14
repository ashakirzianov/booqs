import { cookies } from 'next/headers'

export type UserData = {
    id: string,
}
export async function setAuthToken(token: string | undefined) {
    const cookieStore = await cookies()
    if (token) {
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
        })
    } else {
        cookieStore.delete('token')
    }
}