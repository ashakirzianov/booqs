'use client'
import { AppProvider, FeaturedItem, palettes } from '@/application'
import { AppBar } from '@/components/AppBar'
import { Featured } from '@/components/Featured'
import { ReadingHistory } from '@/components/ReadingHistory'
import { normalWeight, vars } from '@/controls/theme'

export default function ClientHome({ featured }: {
    featured: FeaturedItem[],
}) {
    return <AppProvider>
        <div className={`page light`}>
            <AppBar />
            <ReadingHistory />
            <Featured cards={featured} />
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
    color: var(--theme-primary);
    background: var(--theme-background);
}
`}</style>
        </div>
    </AppProvider>
}