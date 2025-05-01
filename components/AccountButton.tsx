import Link from 'next/link'
import { IconButton } from './Buttons'
import { accountHref, signInHref } from './Links'
import { ProfileBadge } from './ProfilePicture'

export function AccountButton({ user, from }: {
    user?: {
        name: string | null,
        pictureUrl: string | null,
    } | null,
    from?: string,
}) {
    if (!user) {
        return <NotSignedAccountButtion from={from} />
    }
    return <SignedAccountButton
        name={user.name}
        pictureUrl={user.pictureUrl}
    />
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