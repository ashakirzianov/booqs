import { Metadata } from 'next'

const title = 'Booqs'
const description = 'Your personal reading assistant'
export const metadata: Metadata = {
    title, description,
    openGraph: {
        title, description,
    },
    twitter: {
        title, description,
    },
}

export default function MainLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        children
    )
}