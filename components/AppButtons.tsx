import { AppProvider } from '@/application/provider'
import { SignInButton } from '@/components/SignIn'
import { UploadButton } from '@/components/Upload'

export function AppButtons() {
    return <AppProvider>
        <UploadButton />
        <SignInButton />
    </AppProvider>
}