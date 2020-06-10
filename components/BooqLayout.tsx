import React, { ReactNode } from 'react';
import { meter, headerHeight } from 'controls/theme';

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
        <div className='controls-a'>
            <div className='main'>{MainButton}</div>
            <div className='navigation'>{NavigationButton}</div>
        </div>
        <div className='controls-b'>
            <div className='themer'>{ThemerButton}</div>
            <div className='account'>{AccountButton}</div>
        </div>
        <div className='current-page'>
            {CurrentPage}
        </div>
        <div className='pages-left'>
            {PagesLeft}
        </div>
        <style jsx>{`
            .container {
                position: fixed;
                top: 0; bottom: 0; left: 0; right: 0;
                pointer-events: none;
                display: grid;
                grid-template-columns: 1fr ${contentWidth} 1fr;
                grid-template-rows: ${headerHeight} 1fr ${headerHeight};
                grid-template-areas: 
                    "left-top . right-top"
                    "left-middle . right-middle"
                    "left-bottom . right-bottom";
            }
            .controls-a, .controls-b, .current-page, .pages-left {
                pointer-events: auto;
            }
            .main, .navigation, .themer, .account {
                margin: 0 ${meter.large};
            }
            .controls-a {
                grid-area: left-top;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }
            .controls-b {
                grid-area: right-top;
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
            .current-page {
                grid-area: left-bottom;
                display: flex;
                justify-content: flex-start;
                align-items: center;
            }
            .pages-left {
                grid-area: right-bottom;
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }
            `}</style>
    </div>;
}