/*global globalThis*/
import Head from "next/head";
import { useEffect } from "react";

export function SdksHead() {
    useEffect(() => {
        initAppleSdk();
        initFbSdk();
    }, []);
    return <Head>
        <script type="text/javascript" src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" />
        <script async defer src="https://connect.facebook.net/en_US/sdk.js" />
    </Head>;
}

export function sdks() {
    return {
        apple: {
            async signIn() {
                const result = await appleSdk()?.auth.signIn();
                console.log('apple sign', result);
                if (result) {
                    return {
                        token: result.authorization.id_token,
                        name: result.user
                            ? `${result.user.name.firstName} ${result.user.name.lastName}`
                            : undefined,
                    };
                } else {
                    return undefined;
                }
            },
        },
        facebook: {
            async signIn() {
                return new Promise<{ token: string } | undefined>((res, rej) => {
                    const sdk = facebookSdk();
                    if (sdk) {
                        sdk.login(response => {
                            if (response?.authResponse?.accessToken) {
                                res({
                                    token: response.authResponse.accessToken,
                                });
                            } else {
                                res(undefined);
                            }
                        }, {
                            scope: 'email',
                        })
                    } else {
                        rej('Can not load facebook sdk');
                    }
                });
            },
            async signOut() {
                return new Promise((res, rej) => {
                    const sdk = facebookSdk();
                    if (sdk) {
                        sdk.logout(() => {
                            res(true);
                        })
                    } else {
                        rej('Can not load facebook sdk');
                    }
                });
            }
        },
    };
}

function initAppleSdk() {
    appleSdk()?.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_APP_ID,
        scope: 'name email',
        redirectURI: redirectUri(),
        state: 'none',
        usePopup: true,
    });
}

function initFbSdk() {
    facebookSdk()?.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
        autoLogAppEvents: true,
        xfbml: false,
        status: true,
        version: 'v7.0',
    });
}

function appleSdk() {
    return process.browser
        ? globalThis.AppleID
        : undefined;
}

function facebookSdk() {
    return process.browser
        ? globalThis.FB
        : undefined;
}

function redirectUri() {
    const { protocol, host, pathname } = process.browser
        ? window.location
        : undefined ?? {};
    const url = `${protocol}//${host}${pathname}`;
    return url;
}
