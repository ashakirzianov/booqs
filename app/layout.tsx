import '@/app/globals.css'
import { Metadata, Viewport } from 'next'

import { Nunito_Sans, Lora } from 'next/font/google'
import { AppProvider } from '@/application/provider'
import { SpeedInsights } from '@vercel/speed-insights/next'

const nunitoSans = Nunito_Sans({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    variable: '--font-main',
})

const lora = Lora({
    subsets: ['latin-ext', 'cyrillic-ext'],
    display: 'swap',
    weight: ['400', '700'],
    variable: '--font-book',
})

const title = 'Booqs'
const description = 'Your personal reading assistant'
export const metadata: Metadata = {
    title,
    description,
    manifest: `/manifest.json`
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html lang="en">
            <body className={`${nunitoSans.variable} ${lora.variable}`}>
                <main>
                    <AppProvider>
                        {children}
                    </AppProvider>
                </main>
                <SpeedInsights />
            </body>
        </html>
    )
}

export const viewport: Viewport = {
    themeColor: [{
        color: '#FFA500',
        media: '(prefers-color-scheme: light)',
    }, {
        color: '#000000',
        media: '(prefers-color-scheme: dark)',
    }]
}