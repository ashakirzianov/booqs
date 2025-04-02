import React, { ReactNode } from 'react'
import styles from './ReaderLayout.module.css'

type ControlsProps = {
    isControlsVisible: boolean,
    isNavigationOpen: boolean,
    MainButton: ReactNode,
    NavigationButton: ReactNode,
    ThemerButton: ReactNode,
    AccountButton: ReactNode,
    CurrentPage: ReactNode,
    PagesLeft: ReactNode,
    NavigationContent: ReactNode,
    ContextMenu: ReactNode,
    Copilot: ReactNode,
}

type LayoutProps = ControlsProps & {
    BooqContent: ReactNode,
    PrevButton: ReactNode,
    NextButton: ReactNode,
}

export function ReaderLayout({
    BooqContent, PrevButton, NextButton,
    ...controls
}: LayoutProps) {
    return <div className={`${styles.layout}`}>
        {PrevButton}
        <div className={`${styles.booq}`}>
            {BooqContent}
        </div>
        {NextButton}
        <BooqControls {...controls} />
    </div>
}

function BooqControls({
    isControlsVisible, isNavigationOpen,
    MainButton, NavigationButton,
    ThemerButton, AccountButton,
    CurrentPage, PagesLeft,
    NavigationContent,
    ContextMenu, Copilot,
}: ControlsProps) {
    const showControls = isControlsVisible || isNavigationOpen
    const showCtrlClass = showControls ? styles.showCtr : ''
    const navOpenClass = isNavigationOpen ? styles.navopen : ''
    return <div className={`${styles.reader}`}>
        <div className={`${styles.main} ${showCtrlClass}`}>{MainButton}</div>
        <div className={`${styles.nav} ${showCtrlClass}`}>{NavigationButton}</div>
        <div className={`${styles.themer} ${showCtrlClass}`}>{ThemerButton}</div>
        <div className={`${styles.account} ${showCtrlClass}`}>{AccountButton}</div>
        <div className={`${styles.page} ${showCtrlClass}`}>{CurrentPage}</div>
        <div className={`${styles.left} ${showCtrlClass}`}>{PagesLeft}</div>
        <div className={`${styles.content} ${showCtrlClass}`} />
        <div className={`${styles.backTop} ${showCtrlClass}`} />
        <div className={`${styles.backBottom} ${showCtrlClass}`} />
        <div className={`${styles.ctx} ${showCtrlClass}`}>{ContextMenu}{Copilot}</div>
        <div className={`${styles.navc} ${navOpenClass}`}>{NavigationContent}</div>
    </div>
}
