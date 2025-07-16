import { signInLinkHref, signUpLinkHref } from '@/core/href'
import { Resend } from 'resend'

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

    return await sendEmail({ email, content, subject: 'Sign in to Booqs' })
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

    return await sendEmail({ email, content, subject: 'Welcome to Booqs' })
}

async function sendEmail({ email, content, subject }: { email: string, content: string, subject: string }): Promise<boolean> {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
        console.error('RESEND_API_KEY environment variable is not set')
        return false
    }

    const resend = new Resend(resendApiKey)

    try {
        const { data, error } = await resend.emails.send({
            from: 'Booqs <no-reply@booqs.app>',
            to: [email],
            subject,
            text: content,
        })

        if (error) {
            console.error('Failed to send email:', error)
            return false
        }

        console.log('Email sent successfully:', data?.id)
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}