// Tippy styles
import 'tippy.js/dist/tippy.css'
import 'tippy.js/dist/svg-arrow.css'
import 'tippy.js/dist/border.css'
import 'tippy.js/animations/shift-away.css'

// FontAwesome support
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

import { AppProps } from 'next/app'
import { AppProvider } from '@/application'

import { Lato, Lora } from 'next/font/google'

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

export default function App({ Component, pageProps }: AppProps) {
    return <AppProvider>
        <Component {...pageProps} />
    </AppProvider>
}
