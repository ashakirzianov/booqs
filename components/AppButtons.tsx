import { AppProvider } from '@/application/provider'
import { SignInButton } from '@/components/SignInModal'
import { UploadButton } from '@/components/Upload'

export function AppButtons() {
    return <AppProvider>
        <UploadButton />
        <SignInButton />
    </AppProvider>
}