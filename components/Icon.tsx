import React from 'react'

import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import {
    faPlus, faFont as faFontCase, faSignInAlt as faSignIn, faSignOutAlt as faSignOut, faQuestion, faSearch,
    faFileAlt, faUser, faTimes, faListUl, faBookmark, faAngleLeft,
    faQuoteRight, faClone, faLink, faHighlighter, faTrashAlt,
    faEllipsisV,
} from '@fortawesome/free-solid-svg-icons'
import {
    faFacebookF, faApple,
} from '@fortawesome/free-brands-svg-icons'
import {
    faBookmark as faSolidBookmark,
} from '@fortawesome/free-solid-svg-icons'

export type IconName =
    | 'back' | 'more'
    | 'user' | 'sign-in' | 'sign-out'
    | 'upload' | 'appearance' | 'close' | 'remove'
    | 'toc' | 'bookmark-empty' | 'bookmark-solid'
    | 'search' | 'pages'
    | 'facebook' | 'apple'
    | 'quote' | 'copy' | 'link' | 'highlight'
    | 'question'
    ;

export function Icon({ name, size }: {
    name: IconName,
    size?: FontAwesomeIconProps['size'],
}) {
    const icon = iconForName(name)
    return <FontAwesomeIcon
        icon={icon}
        size={size}
    />
}

function iconForName(name: IconName) {
    switch (name) {
        case 'back':
            return faAngleLeft
        case 'more':
            return faEllipsisV
        case 'user':
            return faUser
        case 'sign-in':
            return faSignIn
        case 'sign-out':
            return faSignOut
        case 'close':
            return faTimes
        case 'remove':
            return faTrashAlt
        case 'toc':
            return faListUl
        case 'bookmark-empty':
            return faBookmark
        case 'bookmark-solid':
            return faSolidBookmark
        case 'appearance':
            return faFontCase
        case 'upload':
            return faPlus
        case 'search':
            return faSearch
        case 'pages':
            return faFileAlt
        case 'facebook':
            return faFacebookF
        case 'apple':
            return faApple
        case 'quote':
            return faQuoteRight
        case 'copy':
            return faClone
        case 'link':
            return faLink
        case 'highlight':
            return faHighlighter
        case 'question':
            return faQuestion
        default:
            assertNever(name)
            return faQuestion
    }
}

function assertNever(x: never) {
    return x
}
