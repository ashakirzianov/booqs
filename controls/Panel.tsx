import React from 'react'
import { HasChildren } from './utils'

export const panelWidth = '40rem'

export function Panel({ children }: HasChildren) {
    return <div className="panel rounded m-xl">
        {children}
        <style jsx>{`
            .panel {
                display: flex;
                flex-direction: row;
                flex: 0 1;
                width: 100%;
                max-width: ${panelWidth};
                overflow: hidden;
            }
            `}</style>
    </div>
}
