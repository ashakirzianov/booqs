import React, { ReactNode } from 'react'
import styles from './ReaderLayout.module.css'

type ControlsProps = {
    isControlsVisible: boolean,
    isNavigationOpen: boolean,
    LeftButtons: ReactNode,
    RightButtons: ReactNode,
    CurrentPage?: ReactNode,
    PagesLeft?: ReactNode,
    NavigationContent?: ReactNode,
    ContextMenu?: ReactNode,
    Copilot?: ReactNode,
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
    return <div className={`${styles.layout} text-red`}>
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
    LeftButtons, RightButtons,
    CurrentPage, PagesLeft,
    NavigationContent,
    ContextMenu, Copilot,
}: ControlsProps) {
    const showControls = isControlsVisible || isNavigationOpen
    const showCtrlClass = showControls ? styles.showCtr : ''
    const navOpenClass = isNavigationOpen ? styles.navopen : ''
    return <div className={`${styles.reader}`}>
        <div className={`${styles.leftButtons} ${showCtrlClass}`}>{LeftButtons}</div>
        <div className={`${styles.rightButtons} ${showCtrlClass}`}>{RightButtons}</div>
        <div className={`${styles.page} ${showCtrlClass}`}>{CurrentPage}</div>
        <div className={`${styles.left} ${showCtrlClass}`}>{PagesLeft}</div>
        <div className={`${styles.content} ${showCtrlClass}`} />
        <div className={`${styles.backTop} ${showCtrlClass}`} />
        <div className={`${styles.backBottom} ${showCtrlClass}`} />
        <div className={`${styles.ctx} ${showCtrlClass}`}>{ContextMenu}{Copilot}</div>
        <div className={`${styles.navc} ${navOpenClass}`}>{NavigationContent}</div>
    </div>
}
