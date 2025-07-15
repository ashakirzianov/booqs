import { signInLinkHref, signUpLinkHref } from '@/core/href'

export async function sendSignInLink({
    secret,
    email,
    name,
    username,
}: {
    secret: string,
    email: string,
    name?: string,
    username?: string,
}): Promise<boolean> {
    const displayName = name || username || email
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://booqs.app'
    const signInUrl = `${baseUrl}${signInLinkHref({ email, secret })}`
    
    const content = `Hi ${displayName},

Click here to sign in to your account:
${signInUrl}

If you didn't request this, please ignore this email.

This link will expire in 1 hour for security reasons.`

    return await sendEmail({ email, content })
}

export async function sendSignUpLink({
    secret,
    email,
}: {
    secret: string,
    email: string,
}): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://booqs.app'
    const signUpUrl = `${baseUrl}${signUpLinkHref({ email, secret })}`
    
    const content = `Welcome to Booqs!

Click here to complete your account setup:
${signUpUrl}

If you didn't request this, please ignore this email.

This link will expire in 1 hour for security reasons.`

    return await sendEmail({ email, content })
}

async function sendEmail({ email, content }: { email: string, content: string }): Promise<boolean> {
    console.log(`Email to ${email}:`)
    console.log(content)
    return true
}