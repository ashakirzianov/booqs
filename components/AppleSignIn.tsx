/*global globalThis*/
import Head from "next/head";
import { useEffect } from "react";
import { BorderButton } from "controls/Buttons";

export function AppleSignInButton() {
    return <BorderButton
        icon='apple'
        text='Apple'
        onClick={() => {
            appleSdk()?.auth.signIn().then(result => {
                console.log('Apple sign in result');
                console.log(result);
            });
        }}
    />;
}

export function AppleSignInHead() {
    useEffect(() => {
        console.log(appleSdk());
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
