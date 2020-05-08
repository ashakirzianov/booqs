import React from 'react';
import Head from 'next/head';
import { HasChildren } from './utils';

export function Page({ title, children }: HasChildren & {
    title: string,
}) {
    return <div className="page">
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <FontLinks />
        </Head>
        {children}
        <style jsx global>{`
            * {
                box-sizing: border-box;
            }
            .page {
                display: flex;
                flex: 1;
                flex-direction: column;
            }
            body {
                margin: 0;
                padding: 0;
                font-family: Lato;
                font-weight: 100;
                overflow-x: hidden;
            }
        `}</style>
    </div>;
}

export function FontLinks() {
    return <>
        <link href="https://fonts.googleapis.com/css?family=Lato&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css?family=Lora&display=swap" rel="stylesheet" />
    </>;
}
