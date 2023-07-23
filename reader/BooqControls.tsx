import { ReactNode } from 'react'
import styles from './BooqControls.module.css'

export type ControlsProps = {
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
};

export function BooqControls({
    isControlsVisible, isNavigationOpen,
    MainButton, NavigationButton,
    ThemerButton, AccountButton,
    CurrentPage, PagesLeft,
    NavigationContent,
    ContextMenu,
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
        <div className={`${styles.ctx} ${showCtrlClass}`}>{ContextMenu}</div>
        <div className={`${styles.navc} ${navOpenClass}`}>{NavigationContent}</div>
    </div>
}