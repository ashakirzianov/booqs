import { signInLinkHref, signUpLinkHref } from '@/common/href'
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

    const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/icon.png" alt="Booqs" style="width: 64px; height: 64px; margin-bottom: 16px;">
            <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: 600;">Booqs</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px; font-weight: 500;">Hi ${displayName},</h2>
            <p style="color: #4a4a4a; margin: 0; font-size: 16px; line-height: 1.5;">Click the button below to sign in to your account:</p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="${signInUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Sign In to Booqs</a>
        </div>
        
        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0 0 8px 0; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <p style="color: #6c757d; margin: 0; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
        </div>
    </div>`

    const textContent = `Hi ${displayName},

Click here to sign in to your account:
${signInUrl}

If you didn't request this, please ignore this email.

This link will expire in 1 hour for security reasons.`

    return await sendEmail({ email, htmlContent, textContent, subject: 'Sign in to Booqs' })
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

    const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/icon.png" alt="Booqs" style="width: 64px; height: 64px; margin-bottom: 16px;">
            <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: 600;">Booqs</h1>
        </div>
        
        <div style="background-color: #f0f8ff; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 20px; font-weight: 500;">Welcome to Booqs!</h2>
            <p style="color: #4a4a4a; margin: 0; font-size: 16px; line-height: 1.5;">Click the button below to complete your account setup and start exploring your digital library:</p>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
            <a href="${signUpUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Complete Account Setup</a>
        </div>
        
        <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0 0 8px 0; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <p style="color: #6c757d; margin: 0; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
        </div>
    </div>`

    const textContent = `Welcome to Booqs!

Click here to complete your account setup:
${signUpUrl}

If you didn't request this, please ignore this email.

This link will expire in 1 hour for security reasons.`

    return await sendEmail({ email, htmlContent, textContent, subject: 'Welcome to Booqs' })
}

async function sendEmail({
    email,
    htmlContent,
    textContent,
    subject
}: {
    email: string,
    htmlContent?: string,
    textContent?: string,
    subject: string
}): Promise<boolean> {
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
        console.error('RESEND_API_KEY environment variable is not set')
        return false
    }

    const resend = new Resend(resendApiKey)

    try {
        const emailOptions: any = {
            from: 'Booqs <no-reply@auth.booqs.app>',
            to: email,
            subject,
        }

        if (htmlContent) {
            emailOptions.html = htmlContent
        }
        if (textContent) {
            emailOptions.text = textContent
        }

        const { data, error } = await resend.emails.send(emailOptions)

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