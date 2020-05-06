import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faFontCase, faSignIn, faQuestion, faSearch,
    faFileAlt,
} from '@fortawesome/pro-light-svg-icons';
import { assertNever } from '../core';

export type IconName =
    | 'sign-in' | 'upload' | 'appearance' | 'search'
    | 'pages'
    ;

export function Icon({ name, size }: {
    name: IconName,
    size?: number,
}) {
    const icon = iconForName(name);
    return <FontAwesomeIcon
        icon={icon}
        height={size}
    />;
}

function iconForName(name: IconName) {
    switch (name) {
        case 'sign-in':
            return faSignIn;
        case 'appearance':
            return faFontCase;
        case 'upload':
            return faPlus;
        case 'search':
            return faSearch;
        case 'pages':
            return faFileAlt;
        default:
            assertNever(name);
            return faQuestion;
    }
}
