import React from 'react'
import Head from 'next/head'
import { SdksHead } from '@/plat'
import { HasChildren } from '@/controls/utils'
import { normalWeight } from '@/controls/theme'

import { Lato, Lora } from 'next/font/google'

const lato = Lato({
    subsets: ['latin'],
    display: 'swap',
    weight: ['300', '400', '700'],
    variable: '--font-main',
})

const lora = Lora({
    subsets: ['latin-ext', 'cyrillic-ext'],
    display: 'swap',
    weight: ['400', '700'],
    variable: '--font-book',
})


export function Page({ title, children }: HasChildren & {
    title: string,
}) {
    return <div className={`page ${lato.variable} ${lora.variable} font-normal`}>
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=3.0,minimum-scale=1.0,viewport-fit=cover" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
        </Head>
        <SdksHead />
        {children}
        <style jsx>{`
            .page {
                display: flex;
                flex: 1;
                flex-direction: column;
                font-family: var(--font-main);
                overflow: hidden;
            }
        `}</style>
        <style jsx global>{`
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                padding: 0;
                color: var(--theme-primary);
                background: var(--theme-background);
            }
        `}</style>
    </div>
}
