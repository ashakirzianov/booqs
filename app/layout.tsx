import '@/app/globals.css'
import Script from 'next/script'
import { Metadata } from 'next'

// FontAwesome support
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import { Lato, Lora } from 'next/font/google'

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
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html lang="en">
            <Script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" />
            <Script async defer crossOrigin='anonymous' src="https://connect.facebook.net/en_US/sdk.js" />
            <body className={`${lato.variable} ${lora.variable}`}>
                <main>
                    {children}
                </main>
            </body>
        </html>
    )
}