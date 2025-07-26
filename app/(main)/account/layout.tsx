import { redirect } from 'next/navigation'
import { fetchAuthData } from '@/data/auth'
import { accountHref } from '@/core/href'
import { ProfileIcon, UsersIcon, CollectionIcon } from '@/components/Icons'
import { AccountLink } from './AccountLink'

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await fetchAuthData()
    if (!user) {
        redirect('/auth')
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex gap-8">
                {/* Left Sidebar */}
                <nav className="w-64 flex-shrink-0">
                    <div className="bg-background border border-dimmed rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4 text-primary">Account</h2>
                        <ul className="space-y-2">
                            <li>
                                <AccountLink href={accountHref({ section: 'profile' })} icon={<ProfileIcon />}>
                                    Profile
                                </AccountLink>
                            </li>
                            <li>
                                <AccountLink href={accountHref({ section: 'followers' })} icon={<UsersIcon />}>
                                    Followers
                                </AccountLink>
                            </li>
                            <li>
                                <AccountLink href={accountHref({ section: 'collections' })} icon={<CollectionIcon />}>
                                    Collections
                                </AccountLink>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}