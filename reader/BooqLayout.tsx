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

const contentWidth = '40rem';
export const smallScreenWidth = '60rem';
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
    isVisible,
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
        <div className='back-top' />
        <div className='back-bottom' />
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
                    "main nav  . content . themer account"
                    ".    .    . content . .      .      "
                    "page page . content . left   left   ";
            }
            .content {
                grid-area: content;
                align-self: stretch;
                justify-self: stretch;
            }
            .main, .nav, .themer, .account, .page, .left {
                transition: 250ms transform;
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
            .back-top, .back-bottom {
                display: none;
                transition: 250ms transform;
            }
            @media (max-width: ${smallScreenWidth}) {
                .container {
                    grid-template-columns: auto auto 1fr auto auto;
                    grid-template-rows: ${headerHeight} 1fr ${headerHeight};
                    grid-template-areas: 
                        "main nav  content themer account"
                        ".    .    content .      ."
                        "page page content left   left";
                }
                .back-top, .back-bottom {
                    display: block;
                    z-index: -1;
                    grid-area: 1 / 1 / 1 / 6;
                    align-self: stretch;
                    justify-self: stretch;
                    background: var(${vars.background});
                    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
                }
                .back-top {
                    grid-area: 1 / 1 / 1 / 6;
                }
                .back-bottom {
                    grid-area: 3 / 1 / 3 / 6;
                }
            }
            `}</style>
        <style jsx>{`
            @media (max-width: ${smallScreenWidth}) {
                .main, .nav, .themer, .account, .back-top {
                    transform: ${isVisible ? undefined : `translateY(-${headerHeight})`};
                }
                .page, .left, .back-bottom {
                    transform: ${isVisible ? undefined : `translateY(${headerHeight})`};
                }
            }
            `}</style>
    </div>;
}