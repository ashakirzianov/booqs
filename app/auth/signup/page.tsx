import { getRandomAvatarEmoji } from '@/common/emoji'
import { prevalidateSignupAction, fetchAuthData } from '@/data/auth'
import { SignUpForm } from './SignUpForm'
import { generateRandomName } from './name'
import { AddPasskeyPage } from './AddPasskeyPage'
import { SignUpErrorPage } from './SignUpErrorPage'

export default async function SignUpPage({ searchParams }: {
    searchParams: Promise<{
        email?: string,
        secret?: string,
        return_to?: string,
    }>
}) {
    const { email, secret, return_to } = await searchParams
    const returnTo = return_to ?? '/'

    // Server-side validation - if missing parameters, show error
    if (!email || !secret) {
        return (
            <SignUpErrorPage
                title="Invalid Sign-up Link"
                message="Missing email or secret parameter"
                description="The sign-up link may be malformed or incomplete."
            />
        )
    }

    // Check if user is already authenticated (sign-up completed)
    const authData = await fetchAuthData()

    // Only pre-validate if user is not authenticated yet
    if (authData) {
        return <AddPasskeyPage returnTo={returnTo} />
    } else {
        const validation = await prevalidateSignupAction({ email, secret })

        if (!validation.success) {
            return (
                <SignUpErrorPage
                    title="Invalid Sign-up Link"
                    message={validation.reason}
                    description="Please request a new sign-up link or try signing in if you already have an account."
                />
            )
        }
        // Server-side preparation of initial values
        const initialUsername = email.split('@')[0]
        const initialEmoji = getRandomAvatarEmoji()
        const initialName = generateRandomName()

        return <SignUpForm
            email={email}
            secret={secret}
            initialUsername={initialUsername}
            initialName={initialName}
            initialEmoji={initialEmoji}
            returnTo={returnTo}
        />
    }
}