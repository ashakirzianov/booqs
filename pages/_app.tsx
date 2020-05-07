import { AppProps } from 'next/app'

// Tippy styles
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';
import 'tippy.js/dist/border.css';
import 'tippy.js/animations/shift-away.css';

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
