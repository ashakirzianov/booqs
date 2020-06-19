import React, { useCallback, useMemo } from 'react';
import { BooqPath, BooqRange, BooqNode } from 'core';
import { pathFromId } from 'app';
import { useDocumentEvent } from 'controls/utils';
import { renderNodes } from './render';
import { useOnScroll } from './scroll';

export type BooqSelection = {
    range: BooqRange,
    text: string,
};
export type Augmentation = {
    range: BooqRange,
    color: string,
};
export function BooqContent({
    booqId, nodes, range, augmentation,
    onScroll, onClick,
}: {
    booqId: string,
    nodes: BooqNode[],
    range: BooqRange,
    augmentation: Augmentation[],
    onScroll?: (path: BooqPath) => void,
    onClick?: () => void,
}) {
    useOnScroll(onScroll);
    useOnClick(onClick);
    return useMemo(function () {
        return <div id='booq-root' className='container'>
            {
                renderNodes(nodes, {
                    booqId, range, augmentations: augmentation,
                    path: [],
                })
            }
        </div>;
    }, [nodes, booqId, range, augmentation]);
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
