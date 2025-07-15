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
    const content = `Hi ${displayName},

Click here to sign in to your account:
[Sign In Link with secret: ${secret}]

If you didn't request this, please ignore this email.`

    return await sendEmail({ email, content })
}

export async function sendSignUpLink({
    secret,
    email,
}: {
    secret: string,
    email: string,
}): Promise<boolean> {
    const content = `Welcome to Booqs!

Click here to complete your account setup:
[Sign Up Link with secret: ${secret}]

If you didn't request this, please ignore this email.`

    return await sendEmail({ email, content })
}

async function sendEmail({ email, content }: { email: string, content: string }): Promise<boolean> {
    console.log(`Email to ${email}:`)
    console.log(content)
    return true
}