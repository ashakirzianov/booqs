export function AppleSdkHeader({ state }: {
    state: string,
}) {
    return <>
        <meta name="appleid-signin-client-id" content={process.env.NEXT_PUBLIC_APPLE_APP_ID} />
        <meta name="appleid-signin-scope" content="name email" />
        <meta name="appleid-signin-state" content={state} />
        <meta name="appleid-signin-use-popup" content="true" />
    </>;
}

export function AppleSignInButton() {
    return <>
        <div id="appleid-signin" />
        <script
            type="text/javascript"
            src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        />
    </>;
}
