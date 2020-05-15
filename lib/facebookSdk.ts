/*global globalThis*/

export async function loginFb(): Promise<fb.StatusResponse> {
    return new Promise(res => {
        getFbSdk().then(sdk => {
            sdk.getLoginStatus(status => {
                if (status.status !== 'connected') {
                    sdk.login(res);
                } else {
                    res(status);
                }
            })
        });
    });
}

export async function logoutFb(): Promise<fb.StatusResponse> {
    return new Promise(res => {
        getFbSdk().then(sdk => {
            sdk.getLoginStatus(status => {
                if (status.status === 'connected') {
                    sdk.logout(res);
                } else {
                    res(status);
                }
            })
        });
    });
}

let fbSdk: fb.FacebookStatic | undefined = undefined;
export async function getFbSdk(attempts = 10): Promise<fb.FacebookStatic> {
    if (fbSdk) {
        return fbSdk;
    } else if (globalThis.FB) {
        globalThis.FB.init({
            appId: process.env.NEXT_PUBLIC_FB_APP_ID || '',
            autoLogAppEvents: true,
            xfbml: true,
            version: 'v7.0'
        });
        fbSdk = globalThis.FB;
        return fbSdk;
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
