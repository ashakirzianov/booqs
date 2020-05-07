import { AppProps } from 'next/app'

// Tippy styles
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/dist/border.css';
import 'tippy.js/animations/shift-away.css';

// FontAwesome support
import { config } from '@fortawesome/fontawesome-svg-core' // 👈
import '@fortawesome/fontawesome-svg-core/styles.css' // 👈
config.autoAddCss = false // 👈

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
