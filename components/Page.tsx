import React from 'react';
import Head from 'next/head';
import { usePalette } from 'app';
import { HasChildren } from 'controls/utils';
import {
    menuFont, normalWeight, fontHref,
} from 'controls/theme';


export function Page({ title, children }: HasChildren & {
    title: string,
}) {
    const { background, primary } = usePalette();
    return <div className="page">
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            <link href={fontHref} rel="stylesheet" />
            <script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>
        </Head>
        {children}
        <style jsx>{`
            .page {
                display: flex;
                flex: 1;
                flex-direction: column;
            }
        `}</style>
        <style jsx global>{`
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                font-family: ${menuFont};
                font-weight: ${normalWeight};
                color: ${primary};
                background: ${background};
            }
        `}</style>
    </div>;
}
