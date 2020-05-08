import React from 'react';
import Head from 'next/head';
import { HasChildren } from './utils';
import { menuFont, bookFont } from './theme';

export function Page({ title, children }: HasChildren & {
    title: string,
}) {
    return <div className="page">
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
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
                font-weight: 100;
                overflow-x: hidden;
            }
            @import url('https://fonts.googleapis.com/css2?family=${menuFont}&family=${bookFont}&display=swap');
        `}</style>
    </div>;
}
