import Link from 'next/link'
import { IconButton } from './Buttons'
import { accountHref, signInHref } from './Links'
import { ProfileBadge } from './ProfilePicture'
import { Spinner } from './Loading'

export function AccountButton({ user, loading, from }: {
    user?: {
        name: string | null,
        pictureUrl: string | null,
    } | null,
    loading?: boolean,
    from?: string,
}) {
    if (loading) {
        return <LoadingAccountButton />
    }
    if (!user) {
        return <NotSignedAccountButtion from={from} />
    }
    return <SignedAccountButton
        name={user.name}
        pictureUrl={user.pictureUrl}
    />
}

export function LoadingAccountButton() {
    return <Spinner />
}

export function SignedAccountButton({ name, pictureUrl }: {
    name: string | null,
    pictureUrl: string | null,
}) {
    return <Link href={accountHref()}>
        <ProfileBadge
            name={name ?? undefined}
            picture={pictureUrl ?? undefined}
            size={2}
            border={true}
        />
    </Link>
}

export function NotSignedAccountButtion({ from }: {
    from?: string,
}) {
    return <Link href={signInHref({ returnTo: from })}>
        <IconButton
            icon='sign-in' />
    </Link>
}