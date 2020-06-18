import React, { useCallback, useMemo } from 'react';
import { BooqPath, BooqRange, BooqNode } from 'core';
import { pathFromId } from 'app';
import { useDocumentEvent } from 'controls/utils';
import { renderNodes } from './render';
import { useOnSelection } from './selection';
import { useOnScroll } from './scroll';

export type BooqSelection = {
    range: BooqRange,
    text: string,
};
export type Colorization = {
    range: BooqRange,
    color: string,
};
export function BooqContent({
    booqId, nodes, range, colorization,
    onScroll, onSelection, onClick,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    colorization: Colorization[],
    onScroll?: (path: BooqPath) => void,
    onSelection?: (selection?: BooqSelection) => void,
    onClick?: () => void,
}) {
    useOnScroll(onScroll);
    useOnSelection(onSelection);
    useOnClick(onClick);
    return useMemo(function () {
        return <div id='booq-root' className='container'>
            {
                renderNodes(nodes, {
                    booqId, range, colorization,
                    path: [],
                })
            }
        </div>;
    }, [nodes, booqId, range, colorization]);
}

function useOnClick(callback?: () => void) {
    const actual = useCallback((event: Event) => {
        if (callback && isEventOnContent(event)) {
            callback();
        }
    }, [callback]);
    useDocumentEvent('click', actual);
}

function isEventOnContent(event: Event): boolean {
    const id: string | undefined = (event.target as any).id;
    if (id === undefined) {
        return false;
    }
    const path = pathFromId(id);
    if (path) {
        return true;
    }
    return id === 'booq-root';
}
