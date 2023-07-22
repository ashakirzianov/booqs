import React from 'react'
import Head from 'next/head'
import { SdksHead } from '@/plat'
import { useSettings, palettes } from '@/application'
import { HasChildren } from '@/controls/utils'
import {
    normalWeight, vars,
} from '@/controls/theme'

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
    const { paletteName, palette: { background, primary } } = useSettings()
    return <div className={`page ${paletteName} ${lato.variable} ${lora.variable}`}>
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
                font-weight: ${normalWeight};
                overflow: hidden;
            }
            .page.light {
                ${vars.action}: ${palettes.light.action};
                ${vars.background}: ${palettes.light.background};
                ${vars.border}: ${palettes.light.border};
                ${vars.dimmed}: ${palettes.light.dimmed};
                ${vars.highlight}: ${palettes.light.highlight};
                ${vars.primary}: ${palettes.light.primary};
            }
            .page.sepia {
                ${vars.action}: ${palettes.sepia.action};
                ${vars.background}: ${palettes.sepia.background};
                ${vars.border}: ${palettes.sepia.border};
                ${vars.dimmed}: ${palettes.sepia.dimmed};
                ${vars.highlight}: ${palettes.sepia.highlight};
                ${vars.primary}: ${palettes.sepia.primary};
            }
            .page.dark {
                ${vars.action}: ${palettes.dark.action};
                ${vars.background}: ${palettes.dark.background};
                ${vars.border}: ${palettes.dark.border};
                ${vars.dimmed}: ${palettes.dark.dimmed};
                ${vars.highlight}: ${palettes.dark.highlight};
                ${vars.primary}: ${palettes.dark.primary};
            }
        `}</style>
        <style jsx global>{`
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                padding: 0;
                color: ${primary};
                background: ${background};
            }
        `}</style>
    </div>
}
