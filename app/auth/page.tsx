import { AuthForm } from './AuthForm'

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