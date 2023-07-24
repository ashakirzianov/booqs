import React from 'react'
import Head from 'next/head'
import { SdksHead } from '@/plat'
import { HasChildren } from '@/controls/utils'

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
    return <div className={`flex flex-1 flex-col ${lato.variable} ${lora.variable} font-normal font-main overflow-hidden`}>
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=3.0,minimum-scale=1.0,viewport-fit=cover" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
        </Head>
        <SdksHead />
        {children}
    </div>
}
