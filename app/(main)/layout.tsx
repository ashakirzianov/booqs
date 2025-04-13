import { AppBar } from '@/components/AppBar'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return <section className='flex flex-1 flex-col font-normal font-main overflow-hidden'>
        <AppBar />
        {children}
    </section>
}