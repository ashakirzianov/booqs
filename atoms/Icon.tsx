import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faFontCase, faSignIn, faQuestion, faSearch,
} from '@fortawesome/pro-light-svg-icons';
import { assertNever } from '../core';

export type IconName =
    | 'sign-in' | 'upload' | 'appearance' | 'search'
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
        default:
            assertNever(name);
            return faQuestion;
    }
}
