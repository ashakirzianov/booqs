import Link from 'next/link'
import { IconButton } from './Buttons'
import { accountHref, signInHref } from './Links'
import { ProfileBadge } from './ProfilePicture'

export function AccountButton({ user }: {
    user?: {
        name: string | null,
        pictureUrl: string | null,
    } | null,
}) {
    if (!user) {
        return <NotSignedAccountButtion />
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

export function NotSignedAccountButtion() {
    return <Link href={signInHref()}>
        <IconButton
            icon='sign-in' />
    </Link>
}