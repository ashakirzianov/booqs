/*global globalThis*/
import Head from "next/head";
import { useEffect } from "react";

export function SdksHead() {
    useEffect(() => {
        appleSdk()?.auth.init({
            clientId: process.env.NEXT_PUBLIC_APPLE_APP_ID,
            scope: 'name email',
            redirectURI: redirectUri(),
            state: 'none',
            usePopup: true,
        });
    }, []);
    return <Head>
        <script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" />
    </Head>;
}

export function sdks() {
    return {
        apple: {
            async signIn() {
                const result = await appleSdk()?.auth.signIn();
                console.log('apple sign', result);
                return result?.authorization.id_token;
            }
        }
    };
}

function appleSdk() {
    return process.browser
        ? globalThis.AppleID
        : undefined;
}

function redirectUri() {
    const { protocol, host, pathname } = process.browser
        ? window.location
        : undefined ?? {};
    const url = `${protocol}//${host}${pathname}`;
    return url;
}
