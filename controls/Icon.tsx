import React from 'react';

import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import {
    faPlus, faFontCase, faSignIn, faSignOut, faQuestion, faSearch,
    faFileAlt, faUser,
} from '@fortawesome/pro-light-svg-icons';
import {
    faFacebookF,
} from '@fortawesome/free-brands-svg-icons';

export type IconName =
    | 'user' | 'sign-in' | 'sign-out' | 'upload' | 'appearance' | 'search'
    | 'pages'
    | 'facebook'
    ;

export function Icon({ name, size }: {
    name: IconName,
    size?: FontAwesomeIconProps['size'],
}) {
    const icon = iconForName(name);
    return <FontAwesomeIcon
        icon={icon}
        size={size}
    />;
}

function iconForName(name: IconName) {
    switch (name) {
        case 'user':
            return faUser;
        case 'sign-in':
            return faSignIn;
        case 'sign-out':
            return faSignOut;
        case 'appearance':
            return faFontCase;
        case 'upload':
            return faPlus;
        case 'search':
            return faSearch;
        case 'pages':
            return faFileAlt;
        case 'facebook':
            return faFacebookF;
        default:
            assertNever(name);
            return faQuestion;
    }
}

function assertNever(x: never) {
    return x;
}
