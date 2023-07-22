import { Lato, Lora } from 'next/font/google'
import Script from 'next/script'
import { Metadata } from 'next'


const lato = Lato({
    subsets: ['latin'],
    display: 'swap',
    weight: ['300', '400', '700'],
    variable: '--font-main',
})

const lora = Lora({
    subsets: ['latin-ext', 'cyrillic-ext'],
    display: 'swap',
    weight: ['400', '700'],
    variable: '--font-book',
})

const title = 'Booqs'
const description = 'Booqs is a free e-book reader.'
export const metadata: Metadata = {
    title, description,
    openGraph: {
        title, description,
    },
    twitter: {
        title, description,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode,
}) {
    return (
        <html lang="en">
            <Script async defer src="https://connect.facebook.net/en_US/sdk.js" />
            <Script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" />
            <body className={`${lora.variable} ${lato.variable}`}>
                <main>
                    {children}
                </main>
            </body>
        </html>
    )
}
