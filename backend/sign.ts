import { redis } from './db'
import { nanoid } from 'nanoid'

const SECRET_EXPIRE_SECONDS = 3600 // 1 hour

type SignKind = 'signin' | 'signup'

type SignSecret = {
    kind: SignKind,
    secret: string,
    expiration: string,
    data?: unknown,
}

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
}): Promise<{ success: boolean, data?: unknown }> {
    const stored = await redis.get<SignSecret>(`auth:secret:${email}`)
    
    if (!stored) {
        return { success: false }
    }
    
    // Check expiration
    if (Number(stored.expiration) < (Date.now() / 1000)) {
        return { success: false }
    }
    
    // Check kind and secret match
    if (stored.kind !== kind || stored.secret !== secret) {
        return { success: false }
    }
    
    // Clean up the secret after successful verification
    await redis.del(`auth:secret:${email}`)
    
    return { success: true, data: stored.data }
}