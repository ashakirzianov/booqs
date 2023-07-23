import React from 'react'
import { HasChildren } from './utils'
import { meter } from './theme'

export const panelWidth = '40rem'

export function Panel({ children }: HasChildren) {
    return <div className="panel rounded">
        {children}
        <style jsx>{`
            .panel {
                display: flex;
                flex-direction: row;
                flex: 0 1;
                width: 100%;
                max-width: ${panelWidth};
                margin: ${meter.xLarge};
                overflow: hidden;
            }
            `}</style>
    </div>
}
