'use client'
import { AppProvider } from '@/application'
import { SignIn } from '@/components/SignIn'
import { Upload } from '@/components/Upload'
import { usePopoverSingleton } from '@/controls/Popover'

export function AppButtons() {
    const { singleton, SingletonNode } = usePopoverSingleton()
    return <AppProvider>
        {SingletonNode}
        <Upload singleton={singleton} />
        <SignIn singleton={singleton} />
    </AppProvider>
}