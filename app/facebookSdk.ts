/*global globalThis*/

let initialized = false;
export function facebookSdk() {
    const sdk = globalThis.FB;
    if (!sdk) {
        return undefined;
    }
    if (!initialized) {
        globalThis.FB.init({
            appId: process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v7.0'
        });
        initialized = true;
    }
    return {
        status: () => new Promise<fb.StatusResponse>(
            res => sdk.getLoginStatus(res),
        ),
        login: () => new Promise<fb.StatusResponse>(
            res => sdk.login(res),
        ),
        logut: () => new Promise<fb.StatusResponse>(
            res => sdk.logout(res),
        ),
    };
}
