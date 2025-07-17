import { userForId, DbUser } from './users'
import {
    generateRegistrationOptions, verifyRegistrationResponse,
    generateAuthenticationOptions, verifyAuthenticationResponse,
    RegistrationResponseJSON, AuthenticationResponseJSON, WebAuthnCredential,
} from '@simplewebauthn/server'
import { config } from './config'
import { nanoid } from 'nanoid'
import { redis, sql } from './db'

export async function initiatePasskeyRegistration({
    origin, user,
}: {
    origin?: string,
    user: DbUser,
}) {
    try {
        const { rpID, rpName } = getRPData(origin)

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userName: user.email,
            userDisplayName: user.name,
            timeout: 60000,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred',
            },
        })

        const challengeRecord = await createChallenge({
            challenge: options.challenge,
            kind: 'registration',
            userId: user.id,
        })
        return {
            success: true,
            options,
            id: challengeRecord.id.toString(),
        } as const
    } catch (err) {
        console.error('Error initiating passkey registration', err)
        return {
            error: 'An error occurred while initiating registration',
            success: false as const,
        }
    }
}

export async function verifyPasskeyRegistration({
    id, response, origin, label, ipAddress,
}: {
    id: string,
    response: RegistrationResponseJSON, // The credential JSON received from the client
    origin?: string,
    label?: string,
    ipAddress?: string,
}) {
    try {
        // Retrieve the original challenge we generated for this user
        const expectedChallenge = await getChallengeForId({ id, kind: 'registration' })
        if (!expectedChallenge) {
            return {
                error: 'Registration challenge not found or expired',
                success: false as const,
            }
        }
        if (!expectedChallenge.userId) {
            return {
                error: 'Registration challenge does not have an associated user',
                success: false as const,
            }
        }
        const user = await userForId(expectedChallenge.userId)
        if (!user) {
            return {
                error: 'User not found for user id from the registration challenge',
                success: false as const,
            }
        }

        const { rpID, expectedOrigin } = getRPData(origin)


        // Verify the registration response
        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: `${expectedChallenge.challenge}`,
            expectedOrigin,
            expectedRPID: rpID,
            requireUserVerification: true,
        })

        const { verified, registrationInfo } = verification
        if (!verified || !registrationInfo) {
            return {
                error: 'Registration verification failed',
                success: false as const,
            }
        }

        await saveUserCredential({
            userId: user.id,
            credential: registrationInfo.credential,
            label,
            ipAddress,
        })

        return {
            success: true as const,
            user,
            credential: registrationInfo.credential,
        }
    } catch (err) {
        console.error('Error verifying passkey registration', err)
        return {
            error: 'An error occurred during verification',
            success: false as const,
        }
    }
}

export async function initiatePasskeyLogin({
    origin,
}: {
    origin?: string,
}) {
    try {
        const { rpID } = getRPData(origin)

        const options = await generateAuthenticationOptions({
            timeout: 60000,
            rpID,
            userVerification: 'preferred',
        })

        // Store the challenge for this login attempt
        const challengeRecord = await createChallenge({
            challenge: options.challenge,
            kind: 'login',
        })

        return {
            success: true,
            options,
            id: challengeRecord.id,
        } as const
    } catch (err) {
        console.error('Error initiating passkey login', err)
        return {
            error: 'An error occurred while initiating login',
            success: false as const,
        }
    }

}

export async function verifyPasskeyLogin({
    id, response, origin, ipAddress,
}: {
    id: string,
    response: AuthenticationResponseJSON, // The credential assertion JSON received from the client
    origin?: string,
    ipAddress?: string,
}) {
    try {
        const credentialId = response.id
        const record = await getCredentialRecordByCredentialId(credentialId)
        if (!record || !record.user_id) {
            return {
                error: 'Credential ID not registered',
                success: false,
            } as const
        }
        const user = await userForId(record.user_id)
        if (!user) {
            return {
                error: 'User not found',
                success: false,
            } as const
        }

        // Retrieve expected challenge
        const expectedChallenge = await getChallengeForId({
            id, kind: 'login',
        })
        if (!expectedChallenge) {
            return {
                error: 'Authentication challenge not found or expired',
                success: false,
            } as const
        }

        const { rpID, expectedOrigin } = getRPData(origin)

        const credential: WebAuthnCredential = {
            id: record.id,
            publicKey: decodeBase64URLToUInt8Array(record.public_key),
            counter: record.counter,
            transports: record.transports as AuthenticatorTransport[] ?? [],
        }
        // Verify the authentication response
        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin,
            expectedRPID: rpID,
            credential,
            requireUserVerification: true,
        })

        const { verified, authenticationInfo } = verification
        if (!verified || !authenticationInfo) {
            return {
                error: 'Authentication verification failed',
                success: false,
            } as const
        }

        // Authentication succeeded. Update the credential's counter to prevent replay attacks.
        const { newCounter } = authenticationInfo
        if (typeof newCounter === 'number') {
            await saveUserCredential({
                userId: user.id,
                credential: {
                    ...credential,
                    counter: newCounter,
                },
                ipAddress,
            })
        }

        return {
            success: true,
            user,
        } as const
    } catch (err) {
        console.error('Error verifying passkey login', err)
        return {
            error: 'An error occurred during verification',
            success: false,
        } as const
    }
}

//====== DB ======//

type ChallengeKind = 'registration' | 'login'
type Challenge = {
    kind: ChallengeKind,
    challenge: string,
    expiration: string,
    userId?: string,
}
async function getChallengeForId({ id, kind }: {
    id: string,
    kind: ChallengeKind,
}): Promise<{
    challenge: string,
    userId?: string,
} | undefined> {
    const challenge = await redis.hgetall<Challenge>(`passkey:challenge:${id}`)
    if (!challenge) {
        return undefined
    }
    if (Number(challenge.expiration) < (Date.now() / 1000)) {
        console.warn('Challenge expired', challenge)
        return undefined
    } else if (challenge.kind !== kind) {
        console.warn('Challenge kind mismatch', challenge)
        return undefined
    }
    return {
        challenge: challenge.challenge,
        userId: challenge.userId,
    }
}

async function createChallenge({ userId, challenge, kind }: {
    userId?: string,
    challenge: string,
    kind: ChallengeKind,
}) {
    const expireInSeconds = 300
    const id = nanoid(10)
    const expiration = Math.floor(Date.now() / 1000) + expireInSeconds
    const doc: Challenge = {
        kind,
        challenge,
        expiration: `${expiration}`,
        userId,
    }
    await redis.hmset(`passkey:challenge:${id}`, doc)
    await redis.expire(`passkey:challenge:${id}`, expireInSeconds)

    return { id, ...doc }
}

type CredentialsDocument = {
    user_id: string,
    id: Base64URLString,
    public_key: string,
    counter: number,
    transports: string[] | null,
    label: string | null,
    ip_address: string | null,
}
async function getCredentialRecordByCredentialId(credentialId: string): Promise<CredentialsDocument | null> {
    const res = await sql`SELECT * FROM passkey_credentials WHERE id = ${credentialId}`
    return res[0] as CredentialsDocument ?? null
}

async function saveUserCredential({
    userId,
    credential,
    label,
    ipAddress,
}: {
    userId: string,
    credential: WebAuthnCredential,
    label?: string,
    ipAddress?: string,
}) {
    const { id, publicKey, counter, transports } = credential
    const serializedPublicKey = encodeUInt8ArrayToBase64URL(publicKey)
    return sql`INSERT INTO passkey_credentials (id, user_id, public_key, counter, transports, label, ip_address)
       VALUES (${id}, ${userId}, ${serializedPublicKey}, ${counter}, ${transports ?? null}, ${label ?? null}, ${ipAddress ?? null})
       ON CONFLICT (id)
       DO UPDATE SET
         public_key = EXCLUDED.public_key,
         counter = EXCLUDED.counter,
         transports = EXCLUDED.transports,
         label = COALESCE(EXCLUDED.label, passkey_credentials.label),
         ip_address = EXCLUDED.ip_address,
         updated_at = now()`
}

export async function deleteUserCredentials(userId: string) {
    return await sql`DELETE FROM passkey_credentials WHERE user_id = ${userId}`
}

function getRPData(origin: string | undefined) {
    const { localhost, secureLocalhost, production } = config().origins
    const domain = config().domain
    const rpID = origin === localhost || origin === secureLocalhost
        ? 'localhost'
        : domain

    const expectedOrigin = origin === production
        || origin === localhost
        || origin === secureLocalhost
        ? origin
        : production

    const rpName = config().appName

    return {
        rpID, rpName,
        expectedOrigin,
    }
}

function encodeUInt8ArrayToBase64URL(arr: Uint8Array) {
    return Buffer.from(arr).toString('base64url')
}

function decodeBase64URLToUInt8Array(base64url: string) {
    return Uint8Array.from(Buffer.from(base64url, 'base64url'))
}