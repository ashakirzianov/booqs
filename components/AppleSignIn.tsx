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
