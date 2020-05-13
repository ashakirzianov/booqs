import React from 'react';

import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import {
    faPlus, faFontCase, faSignIn, faQuestion, faSearch,
    faFileAlt,
} from '@fortawesome/pro-light-svg-icons';
import {
    faFacebookF,
} from '@fortawesome/free-brands-svg-icons';
import { assertNever } from '../lib';

export type IconName =
    | 'sign-in' | 'upload' | 'appearance' | 'search'
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
        case 'facebook':
            return faFacebookF;
        default:
            assertNever(name);
            return faQuestion;
    }
}
