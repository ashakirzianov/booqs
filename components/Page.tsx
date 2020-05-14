import React from 'react';
import Head from 'next/head';
import { HasChildren } from '../controls/utils';
import {
    menuFont, bookFont, normalWeight, boldWeight, extraBoldWeight,
    menuFontPrimary, logoFont,
} from '../controls/theme';
import { usePalette } from '../app';

export function Page({ title, children }: HasChildren & {
    title: string,
}) {
    const { background, primary } = usePalette();
    return <div className="page">
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <link href={`https://fonts.googleapis.com/css2?family=${menuFontPrimary}:wght@${normalWeight};${boldWeight};${extraBoldWeight}&${logoFont}:wght@${normalWeight};${boldWeight};${extraBoldWeight}&family=${bookFont}&display=swap`} rel="stylesheet" />
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
                font-family: ${menuFont};
                font-weight: ${normalWeight};
                color: ${primary};
                background: ${background};
                overflow-x: hidden;
            }
        `}</style>
    </div>;
}
