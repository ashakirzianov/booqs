import React, { ReactNode } from 'react';
import { meter, headerHeight, vars } from 'controls/theme';

type ControlsProps = {
    isVisible: boolean,
    isNavigationOpen: boolean,
    MainButton: ReactNode,
    NavigationButton: ReactNode,
    ThemerButton: ReactNode,
    AccountButton: ReactNode,
    CurrentPage: ReactNode,
    PagesLeft: ReactNode,
    NavigationContent: ReactNode,
};
type LayoutProps = ControlsProps & {
    BooqContent: ReactNode,
    PrevButton: ReactNode,
    NextButton: ReactNode,
    ContextMenu: ReactNode,
};

const contentWidth = '50rem';
export const smallScreenWidth = '1000px';
export function BooqLayout({
    BooqContent, PrevButton, NextButton, ContextMenu,
    ...controls
}: LayoutProps) {
    return <div className='container'>
        <BooqControls {...controls} />
        <div className='booq'>
            {PrevButton}
            {BooqContent}
            {NextButton}
            {ContextMenu}
        </div>
        <style jsx>{`
            .container {
                display: flex;
                flex: 1;
                flex-flow: column;
                align-items: center;
            }
            .booq {
                display: flex;
                flex-flow: column;
                align-items: center;
                width: 100%;
                max-width: ${contentWidth};
            }
            `}</style>
    </div>;
}

function BooqControls({
    MainButton, NavigationButton,
    ThemerButton, AccountButton,
    CurrentPage, PagesLeft,
}: ControlsProps) {
    return <div className='container'>
        <div className='main'>{MainButton}</div>
        <div className='nav'>{NavigationButton}</div>
        <div className='themer'>{ThemerButton}</div>
        <div className='account'>{AccountButton}</div>
        <div className='page'>{CurrentPage}</div>
        <div className='left'>{PagesLeft}</div>
        <div className='content' />
        <div className='filler-top' />
        <div className='filler-bottom' />
        <style jsx>{`
            .container {
                position: fixed;
                top: 0; bottom: 0; left: 0; right: 0;
                pointer-events: none;
                display: grid;
                justify-items: center;
                align-items: center;
                grid-template-columns: auto auto 1fr ${contentWidth} 1fr auto auto;
                grid-template-rows: ${headerHeight} 1fr ${headerHeight};
                grid-template-areas: 
                    "main nav . content . themer account"
                    ".    .   . content . .      .      "
                    "page .   . content . .      left   ";
            }
            .content {
                grid-area: content;
                align-self: stretch;
                justify-self: stretch;
            }
            .main, .nav, .themer, .account {
                pointer-events: auto;
                padding: 0 ${meter.large};
            }
            .main {
                grid-area: main;
            }
            .nav {
                grid-area: nav;
            }
            .themer {
                grid-area: themer;
            }
            .account {
                grid-area: account;
            }
            .page {
                grid-area: page;
            }
            .left {
                grid-area: left;
            }
            .filler-top, .filler-bottom {
                display: none;
            }
            @media (max-width: ${smallScreenWidth}) {
                .container {
                    grid-template-columns: auto auto 1fr auto auto;
                    grid-template-rows: ${headerHeight} 1fr ${headerHeight};
                    grid-template-areas: 
                        "main nav content themer account"
                        ".    .   content .      ."
                        "page .   content .      left";
                }
                .filler-top, .filler-bottom {
                    display: block;
                    z-index: -1;
                    grid-area: 1 / 1 / 1 / 6;
                    align-self: stretch;
                    justify-self: stretch;
                    background: var(${vars.background});
                }
                .filler-top {
                    grid-area: 1 / 1 / 1 / 6;
                    box-shadow: 0px +2px 2px rgba(0, 0, 0, 0.1);
                }
                .filler-bottom {
                    grid-area: 3 / 1 / 3 / 6;
                    box-shadow: 0px -2px 2px rgba(0, 0, 0, 0.1);
                }
            }
            `}</style>
    </div>;
}