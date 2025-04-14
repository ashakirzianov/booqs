import { setAuthToken, UserData } from '@/app/auth'
import { initiatePasskeyRegistration, verifyPasskeyRegistration } from '@/backend/passkey'
import { generateToken } from '@/backend/token'

export async function GET(request: Request) {
    const origin = request.headers.get('origin')
    const { success, options, id } = await initiatePasskeyRegistration({
        requestOrigin: origin ?? undefined,
    })
    return Response.json({
        success,
        options,
        id,
    })
}

export async function POST(request: Request,) {
    const { id, response } = await request.json()
    const origin = request.headers.get('origin') ?? undefined
    const { success, user } = await verifyPasskeyRegistration({
        id,
        response,
        requestOrigin: origin,
    })
    if (success) {
        const token = generateToken(user._id)
        const userData: UserData = {
            id: user._id,
        }
        setAuthToken(token)
        return Response.json({
            success,
            user: userData,
        })
    } else {
        return Response.json({
            success,
            error: 'Registration failed',
        })
    }
}