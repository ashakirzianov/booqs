import { AuthForm } from './AuthForm'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Sign In - Booqs',
        description: 'Sign in to your Booqs account to access your digital library and reading progress.',
    }
}

export default async function Page({ searchParams }: {
    searchParams: Promise<{
        [key: string]: string | undefined
    }>,
}) {
    let { return_to } = await searchParams
    return_to = return_to ?? '/'
    return (
        <AuthForm returnTo={return_to} />
    )
}