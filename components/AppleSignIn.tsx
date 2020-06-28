import Head from "next/head";
import { useCustomDocumentEvent } from "controls/utils";

export function AppleSignInHead() {
    return <Head>
        <meta name="appleid-signin-client-id" content={process.env.NEXT_PUBLIC_APPLE_APP_ID} />
        <meta name="appleid-signin-scope" content="name email" />
        <meta name="appleid-signin-state" content="default" />
        <meta name="appleid-signin-redirect-uri" content="https://www.booqs.app" />
        <meta name="appleid-signin-use-popup" content="true" />
    </Head>;
}

export function AppleSignInButton() {
    useCustomDocumentEvent<any>('AppleIDSignInOnSuccess', data => {
        console.log(data);
    });
    useCustomDocumentEvent<any>('AppleIDSignInOnFailure', data => {
        console.log(data);
    });
    return <>
        <div
            id="appleid-signin" data-color="black" data-border="true" data-type="sign in"
        />
        <script
            type="text/javascript"
            src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        />
    </>;
}
