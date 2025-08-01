import { redirect } from 'next/navigation'
import { authHref } from '@/common/href'
import { fetchPasskeyData } from '@/data/auth'
import { DeleteAccountButton } from '@/components/DeleteAccountButton'
import { SignoutButton } from '@/components/SignoutButton'
import { ProfileData } from '@/components/ProfileData'
import { PasskeySection } from '@/components/PasskeySection'
import { getCurrentUser } from '@/data/user'

export default async function ProfilePage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect(authHref({}))
    }

    const passkeys = await fetchPasskeyData()

    return (
        <div className="space-y-8">
            {/* Profile Section */}
            <ProfileData user={user} />

            {/* Passkeys Section */}
            <PasskeySection initialPasskeys={passkeys} />

            {/* Account Actions - At Bottom */}
            <div className="border-t border-dimmed pt-6 mt-8">
                <div className="flex gap-3 justify-center">
                    <SignoutButton />
                    <DeleteAccountButton account={{
                        name: user.name,
                        joinedAt: user.joinedAt,
                    }} />
                </div>
            </div>
        </div>
    )
}