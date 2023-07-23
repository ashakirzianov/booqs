import React, { ReactNode } from 'react'
import {
    meter, smallScreenWidth,
} from '@/controls/theme'
import { BooqControls, ControlsProps } from './BooqControls'


type LayoutProps = ControlsProps & {
    BooqContent: ReactNode,
    PrevButton: ReactNode,
    NextButton: ReactNode,
};

const contentWidth = '45rem'
export function ReaderLayout({
    BooqContent, PrevButton, NextButton,
    ...controls
}: LayoutProps) {
    return <div className='layout'>
        {PrevButton}
        <div className='booq'>
            {BooqContent}
        </div>
        {NextButton}
        <BooqControls {...controls} />
        <style jsx>{`
            .layout {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
            }
            .booq {
                display: flex;
                flex-flow: column;
                align-items: stretch;
                width: 100%;
                max-width: ${contentWidth};
            }
            @media (max-width: ${smallScreenWidth}) {
                .booq {
                    padding: 0 ${meter.large};
                }
                .layout {
                    padding: ${meter.xxLarge} 0;
                }
            }
            `}</style>
    </div>
}
