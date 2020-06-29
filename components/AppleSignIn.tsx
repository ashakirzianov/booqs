import Head from "next/head";
import { useCustomDocumentEvent } from "controls/utils";
import { ReactNode } from "react";

export function AppleSignInHead() {
    return <Head>
        <meta name="appleid-signin-client-id" content={process.env.NEXT_PUBLIC_APPLE_APP_ID} />
        <meta name="appleid-signin-scope" content="name email" />
        <meta name="appleid-signin-state" content="default" />
        <meta name="appleid-signin-redirect-uri" content={redirectUrl()} />
        <meta name="appleid-signin-use-popup" content="true" />
    </Head>;
}

function redirectUrl() {
    const { protocol, host, pathname } = process.browser
        ? window.location
        : undefined ?? {};
    const url = `${protocol}//${host}${pathname}`;
    return url;
}

export function AppleSignInButton() {
    return <AppleSignInButtonContainer>
        <div className='button'>
            Apple
        </div>
        <style jsx>{`
            .button {
                display: flex;
                justify-content: center;
                cursor: pointer;
                width: 100px;
                height: 50px;
            }
                `}</style>
    </AppleSignInButtonContainer>;
}

function AppleSignInButtonContainer({ children }: {
    children: ReactNode,
}) {
    useCustomDocumentEvent<any>('AppleIDSignInOnSuccess', data => {
        console.log('success');
        console.log(data);
    });
    useCustomDocumentEvent<any>('AppleIDSignInOnFailure', data => {
        console.log('failure');
        console.log(data);
    });
    return <>
        <div id="appleid-signin" data-color="black" data-type="sign in">
            {children}
        </div>
        <script
            type="text/javascript"
            src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
        />
    </>;
}
