import React from 'react';
import Head from 'next/head';

export function PageHead({ title }: {
    title: string,
}) {
    return <Head>
        <title>{title}</title>
        <FontLinks />;
    </Head>;
}

export function FontLinks() {
    return <>
        <link href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Lora&display=swap" rel="stylesheet" />
    </>;
}
