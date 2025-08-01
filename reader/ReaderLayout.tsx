import React, { ReactNode } from 'react'
import styles from './ReaderLayout.module.css'

type ControlsProps = {
    isControlsVisible: boolean,
    isLeftPanelOpen: boolean,
    isRightPanelOpen: boolean,
    LeftButtons: ReactNode,
    RightButtons: ReactNode,
    LeftFooter?: ReactNode,
    RightFooter?: ReactNode,
    LeftPanelContent?: ReactNode,
    RightPanelContent?: ReactNode,
    ContextMenu?: ReactNode,
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
    isControlsVisible, isLeftPanelOpen, isRightPanelOpen,
    LeftButtons, RightButtons,
    LeftFooter, RightFooter,
    LeftPanelContent, RightPanelContent,
    ContextMenu,
}: ControlsProps) {
    const showControls = isControlsVisible || isLeftPanelOpen || isRightPanelOpen
    const showCtrlClass = showControls ? styles.showCtr : ''
    const leftPanelOpenClass = isLeftPanelOpen ? styles.leftPanelOpen : ''
    const rightPanelOpenClass = isRightPanelOpen ? styles.rightPanelOpen : ''
    return <div className={`${styles.reader}`}>
        <div className={`${styles.leftButtons} ${showCtrlClass}`}>{LeftButtons}</div>
        <div className={`${styles.rightButtons} ${showCtrlClass}`}>{RightButtons}</div>
        <div className={`${styles.leftFooter} ${showCtrlClass}`}>{LeftFooter}</div>
        <div className={`${styles.rightFooter} ${showCtrlClass}`}>{RightFooter}</div>
        <div className={`${styles.content} ${showCtrlClass}`} />
        <div className={`${styles.backTop} ${showCtrlClass}`} />
        <div className={`${styles.backBottom} ${showCtrlClass}`} />
        <div className={`${styles.ctx} ${showCtrlClass}`}>{ContextMenu}</div>
        <div className={`${styles.leftPanelc} ${leftPanelOpenClass}`}>{LeftPanelContent}</div>
        <div className={`${styles.rightPanelc} ${rightPanelOpenClass}`}>{RightPanelContent}</div>
    </div>
}
