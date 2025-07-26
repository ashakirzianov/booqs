import Link from 'next/link'
import { PanelButton } from './Buttons'
import { accountHref, authHref } from '../common/href'
import { ProfileBadge } from './ProfilePicture'
import { SignInIcon, Spinner } from './Icons'
import { AccountData } from '@/data/user'

export function AccountButton({ user, loading, from }: {
    user?: AccountData,
    loading?: boolean,
    from?: string,
}) {
    return <PanelButton>
        {
            loading ? <LoadingAccountButton />
                : user ? <SignedAccountButton
                    name={user.name}
                    profilePictureURL={user.profilePictureURL}
                    emoji={user.emoji}
                />
                    : <NotSignedAccountButton from={from} />
        }
    </PanelButton>
}

export function LoadingAccountButton() {
    return <Spinner />
}

export function SignedAccountButton({ name, profilePictureURL, emoji }: Pick<AccountData, 'name' | 'profilePictureURL' | 'emoji'>) {
    return <Link href={accountHref()}>
        <ProfileBadge
            name={name ?? undefined}
            picture={profilePictureURL ?? undefined}
            emoji={emoji ?? undefined}
            size={2}
            border={false}
        />
    </Link>
}

export function NotSignedAccountButton({ from }: {
    from?: string,
}) {
    return <Link href={authHref({ returnTo: from })}>
        <SignInIcon />
    </Link>
}