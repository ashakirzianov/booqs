'use client'
import { AppProvider } from '@/application'
import { SignIn } from '@/components/SignIn'
import { Themer } from '@/components/Themer'
import { Upload } from '@/components/Upload'
import { usePopoverSingleton } from '@/controls/Popover'

export default function AppButtons() {
    const { singleton, SingletonNode } = usePopoverSingleton()
    return <AppProvider>
        {SingletonNode}
        <Upload singleton={singleton} />
        <Themer singleton={singleton} />
        <SignIn singleton={singleton} />
    </AppProvider>
}