import '@/app/globals.css'
import Script from 'next/script'
import { Metadata } from 'next'

// FontAwesome support
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import { Lato, Lora } from 'next/font/google'
import { SdksHead } from '@/plat'

const lato = Lato({
    subsets: ['latin'],
    display: 'swap',
    weight: ['100', '300', '400', '700'],
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
    title, description,
    themeColor: '#FFA500',
    manifest: `/manifest.json`,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html lang="en">
            <SdksHead />
            <body className={`${lato.variable} ${lora.variable}`}>
                <main>
                    {children}
                </main>
            </body>
        </html>
    )
}