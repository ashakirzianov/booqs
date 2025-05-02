import Link from 'next/link'
import { ActionButtonWrapper } from './Buttons'
import { accountHref, signInHref } from './Links'
import { ProfileBadge } from './ProfilePicture'
import { SignInIcon, Spinner } from './Icons'

export function AccountButton({ user, loading, from }: {
    user?: {
        name: string | null,
        pictureUrl: string | null,
    } | null,
    loading?: boolean,
    from?: string,
}) {
    return <ActionButtonWrapper>
        {
            loading ? <LoadingAccountButton />
                : user ? <SignedAccountButton
                    name={user.name}
                    pictureUrl={user.pictureUrl}
                />
                    : <NotSignedAccountButtion from={from} />
        }
    </ActionButtonWrapper>
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
        <SignInIcon />
    </Link>
}