import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus, faFontCase, faSignIn, faQuestion,
} from '@fortawesome/pro-light-svg-icons';
import { assertNever } from '../core';

export type IconName =
    | 'sign-in' | 'upload' | 'appearance'
    ;

export function Icon({
    name
}: {
    name: IconName,
}) {
    const icon = iconForName(name);
    return <FontAwesomeIcon icon={icon} />;
}

function iconForName(name: IconName) {
    switch (name) {
        case 'sign-in':
            return faSignIn;
        case 'appearance':
            return faFontCase;
        case 'upload':
            return faPlus;
        default:
            assertNever(name);
            return faQuestion;
    }
}
