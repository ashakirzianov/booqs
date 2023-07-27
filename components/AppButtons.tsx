'use client'
import { AppProvider } from '@/application'
import { SignIn } from '@/components/SignIn'
import { Upload } from '@/components/Upload'

export function AppButtons() {
    return <AppProvider>
        <Upload />
        <SignIn />
    </AppProvider>
}