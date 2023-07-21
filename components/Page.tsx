import React from 'react'
import Head from 'next/head'
import { SdksHead } from 'plat'
import { useSettings, palettes } from 'app'
import { HasChildren } from 'controls/utils'
import {
    menuFont, normalWeight, fontHref, vars,
} from 'controls/theme'


export function Page({ title, children }: HasChildren & {
    title: string,
}) {
    const { paletteName, palette: { background, primary } } = useSettings()
    return <div className={`page ${paletteName}`}>
        <Head>
            <title>{title}</title>
            <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=3.0,minimum-scale=1.0,viewport-fit=cover" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/manifest.json" />
            <link href={fontHref} rel="stylesheet" />
            <script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>
        </Head>
        <SdksHead />
        {children}
        <style jsx>{`
            .page {
                display: flex;
                flex: 1;
                flex-direction: column;
                font-family: ${menuFont};
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
