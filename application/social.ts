'use client'
/*global globalThis*/
import Script from 'next/script'


export function SocialScripts() {
    return (
        Script({
            type: 'text/javascript',
            src: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
            onLoad: initAppleSdk
        }),
        Script({
            async: true,
            defer: true,
            crossOrigin: 'anonymous',
            src: 'https://connect.facebook.net/en_US/sdk.js',
            onLoad: initFbSdk
        })
    )
}

export function social() {
    return {
        apple: {
            async signIn() {
                const result = await appleSdk()?.auth.signIn()
                console.log('apple sign', result)
                if (result) {
                    return {
                        token: result.authorization.id_token,
                        name: result.user
                            ? `${result.user.name.firstName} ${result.user.name.lastName}`
                            : undefined,
                    }
                } else {
                    return undefined
                }
            },
        },
        facebook: {
            async signIn() {
                return new Promise<{ token: string } | undefined>((res, rej) => {
                    const sdk = facebookSdk()
                    if (sdk) {
                        sdk.login(response => {
                            if (response?.authResponse?.accessToken) {
                                res({
                                    token: response.authResponse.accessToken,
                                })
                            } else {
                                res(undefined)
                            }
                        }, {
                            scope: 'email',
                        })
                    } else {
                        rej('Can not load facebook sdk')
                    }
                })
            },
            async signOut() {
                return new Promise((res, rej) => {
                    const sdk = facebookSdk()
                    if (sdk) {
                        sdk.logout(() => {
                            res(true)
                        })
                    } else {
                        rej('Can not load facebook sdk')
                    }
                })
            }
        },
    }
}

function initAppleSdk() {
    appleSdk()?.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_APP_ID,
        scope: 'name email',
        redirectURI: redirectUri(),
        state: 'none',
        usePopup: true,
    })
}

function initFbSdk() {
    facebookSdk()?.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
        autoLogAppEvents: true,
        xfbml: false,
        status: true,
        version: 'v17.0',
    })
}

function appleSdk() {
    return typeof window !== 'undefined'
        ? globalThis.AppleID
        : undefined
}

function facebookSdk() {
    return typeof window !== 'undefined'
        ? globalThis.FB
        : undefined
}

function redirectUri() {
    const { protocol, host, pathname } = typeof window !== 'undefined'
        ? window.location
        : undefined
        ?? {}
    const url = `${protocol}//${host}/`
    return url
}
