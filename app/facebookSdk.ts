/*global globalThis*/

export async function facebookStatus() {
    const sdk = await getFbSdk();
    return new Promise<fb.StatusResponse>(
        res => sdk.getLoginStatus(res),
    );
}

export async function facebookLogin() {
    const sdk = await getFbSdk();
    return new Promise<fb.StatusResponse>(
        res => sdk.login(res),
    );
}

export async function facebookLogout() {
    const sdk = await getFbSdk();
    return new Promise<fb.StatusResponse>(
        res => sdk.logout(res),
    );
}

async function getFbSdk(attempts = 10): Promise<fb.FacebookStatic> {
    if (globalThis.FB) {
        return globalThis.FB;
    } else {
        addScriptTag();
        return new Promise((resolve, reject) => {
            if (attempts > 0) {
                return setTimeout(
                    () => getFbSdk(attempts - 1).then(resolve),
                    100,
                );
            } else {
                reject(`Can't load fb sdk`);
            }
        });
    }
}

function addScriptTag() {
    (window as any).fbAsyncInit = () => {
        globalThis.FB.init({
            appId: process.env.NEXT_PUBLIC_FB_APP_ID || '',
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v7.0'
        });
    };
    const id = 'facebook-jssdk';
    const scriptTag: any = document.getElementsByTagName('script')[0];
    if (document.getElementById(id)) {
        return;
    }
    const sdkScript = document.createElement('script');
    sdkScript.id = id;
    sdkScript.src = '//connect.facebook.net/en_US/sdk.js';
    scriptTag.parentNode.insertBefore(sdkScript, scriptTag);
}
