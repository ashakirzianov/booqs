import { redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import { fetchPasskeyData } from '@/data/auth'
import { ProfileData } from '@/app/(main)/profile/ProfileData'
import { getCurrentUser } from '@/data/user'
import { DeleteAccountButton } from './DeleteAccountButton'
import { PasskeySection } from './PasskeySection'
import { SignoutButton } from './SignoutButton'
import styles from '@/app/(main)/MainLayout.module.css'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Profile - Booqs',
        description: 'Manage your account profile, passkeys, and account settings.',
    }
}

export default async function ProfilePage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect(authHref({}))
    }

    const passkeys = await fetchPasskeyData()

    return (
        <main className={styles.mainContent}>
            <div className="space-y-8">
                {/* Profile Section */}
                <ProfileData user={user} />

                {/* Passkeys Section */}
                <PasskeySection initialPasskeys={passkeys} />

                {/* Account Actions - At Bottom */}
                <div className="pt-6 mt-8">
                    <div className="flex gap-3 justify-center">
                        <SignoutButton />
                        <DeleteAccountButton account={{
                            name: user.name,
                            joinedAt: user.joinedAt,
                        }} />
                    </div>
                </div>
            </div>
        </main>
    )
}