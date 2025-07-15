import { redis } from './db'
import { nanoid } from 'nanoid'
import { userForEmail, createUser, DbUser } from './users'
import { sendSignInLink, sendSignUpLink } from './send'
import { generateToken } from './token'

const SECRET_EXPIRE_SECONDS = 3600 // 1 hour

type SignKind = 'signin' | 'signup'

type SignSecret = {
    kind: SignKind,
    secret: string,
    expiration: string,
    data?: unknown,
}

export type InitiateSignRequestResult = 
    | { kind: 'signin' }
    | { kind: 'signup' }
    | { kind: 'error', error: string }

export type CompleteSignInRequestResult = 
    | { success: true, token: string }
    | { success: false, reason: string }

export type CompleteSignUpResult = 
    | { success: true, token: string, user: DbUser }
    | { success: false, reason: string }

export async function createSignSecret({
    email,
    kind,
    data,
}: {
    email: string,
    kind: SignKind,
    data?: unknown,
}): Promise<{ secret: string }> {
    const secret = nanoid(32)
    const expiration = Math.floor(Date.now() / 1000) + SECRET_EXPIRE_SECONDS
    
    const doc: SignSecret = {
        kind,
        secret,
        expiration: `${expiration}`,
        data,
    }
    
    await redis.set(`auth:secret:${email}`, doc)
    await redis.expire(`auth:secret:${email}`, SECRET_EXPIRE_SECONDS)
    
    return { secret }
}

export async function verifySignSecret({
    email,
    kind,
    secret,
}: {
    email: string,
    kind: SignKind,
    secret: string,
}): Promise<{ success: true, data?: unknown } | { success: false, reason: string }> {
    const stored = await redis.get<SignSecret>(`auth:secret:${email}`)
    
    if (!stored) {
        return { success: false, reason: 'Secret not found' }
    }
    
    // Check expiration
    if (Number(stored.expiration) < (Date.now() / 1000)) {
        return { success: false, reason: 'Secret expired' }
    }
    
    // Check kind and secret match
    if (stored.kind !== kind || stored.secret !== secret) {
        return { success: false, reason: 'Invalid secret' }
    }
    
    // Clean up the secret after successful verification
    await redis.del(`auth:secret:${email}`)
    
    return { success: true, data: stored.data }
}

export async function initiateSignRequest({
    email,
    from,
}: {
    email: string,
    from: string,
}): Promise<InitiateSignRequestResult> {
    try {
        const existingUser = await userForEmail(email)
        
        if (existingUser) {
            // User exists, send sign-in link
            const { secret } = await createSignSecret({
                email,
                kind: 'signin',
                data: { from },
            })
            
            const emailSent = await sendSignInLink({
                secret,
                email,
                name: existingUser.name ?? undefined,
                username: existingUser.username,
            })
            
            if (!emailSent) {
                return { kind: 'error', error: 'Failed to send sign-in email' }
            }
            
            return { kind: 'signin' }
        } else {
            // User doesn't exist, send sign-up link
            const { secret } = await createSignSecret({
                email,
                kind: 'signup',
                data: { from },
            })
            
            const emailSent = await sendSignUpLink({
                secret,
                email,
            })
            
            if (!emailSent) {
                return { kind: 'error', error: 'Failed to send sign-up email' }
            }
            
            return { kind: 'signup' }
        }
    } catch (err) {
        console.error('Error initiating sign request:', err)
        return { kind: 'error', error: 'An error occurred while processing the request' }
    }
}

export async function completeSignInRequest({
    email,
    secret,
}: {
    email: string,
    secret: string,
}): Promise<CompleteSignInRequestResult> {
    try {
        const verification = await verifySignSecret({
            email,
            kind: 'signin',
            secret,
        })
        
        if (!verification.success) {
            return { success: false, reason: verification.reason }
        }
        
        const user = await userForEmail(email)
        if (!user) {
            return { success: false, reason: 'User not found' }
        }
        
        const token = generateToken(user.id)
        
        return { success: true, token }
    } catch (err) {
        console.error('Error completing sign-in request:', err)
        return { success: false, reason: 'An error occurred while processing the request' }
    }
}

export async function completeSignUp({
    email,
    secret,
    username,
    name,
    emoji,
}: {
    email: string,
    secret: string,
    username?: string,
    name?: string,
    emoji?: string,
}): Promise<CompleteSignUpResult> {
    try {
        const verification = await verifySignSecret({
            email,
            kind: 'signup',
            secret,
        })
        
        if (!verification.success) {
            return { success: false, reason: verification.reason }
        }
        
        // Check if user already exists
        const existingUser = await userForEmail(email)
        if (existingUser) {
            return { success: false, reason: 'User already exists' }
        }
        
        // Create new user
        const user = await createUser({
            email,
            username,
            name,
            profilePictureUrl: undefined,
            emoji,
        })
        
        const token = generateToken(user.id)
        
        return { success: true, token, user }
    } catch (err) {
        console.error('Error completing sign-up:', err)
        return { success: false, reason: 'An error occurred while processing the request' }
    }
}