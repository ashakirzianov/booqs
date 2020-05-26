import React, { memo, createElement, ReactNode, useEffect } from 'react';
import { throttle } from 'lodash';
import {
    BooqNode, BooqPath, pathToString, BooqData,
    pathToId, BooqRange, pathInRange, pathFromId,
} from '../app';
import { booqHref } from 'controls/Links';


export const BooqContent = memo(function BooqContent({ booq, onScroll }: {
    booq: BooqData,
    onScroll?: (path: BooqPath) => void,
}) {
    useScroll(onScroll);
    const nodes = booq.fragment.nodes;
    const range: BooqRange = {
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path,
    };
    const path = [range.start[0]];
    return <div id='booq-root' className='container'>
        <Nodes
            booqId={booq.id}
            nodes={nodes}
            path={path}
            range={range}
        />
    </div>;
});

function Nodes({ nodes, range, booqId, path }: {
    booqId: string,
    nodes: BooqNode[],
    path: BooqPath,
    range: BooqRange,
}) {
    const prefix = path.slice(0, path.length - 1);
    const offset = path[path.length - 1] ?? 0;
    return <>
        {
            nodes.map(
                (node, idx) => renderNode({ node, path: [...prefix, offset + idx], range, booqId }),
            )
        }
    </>;
}

// --- Scroll

function useScroll(callback?: (path: BooqPath) => void) {
    useEffect(() => {
        const listener = throttle(function () {
            if (callback) {
                const path = getCurrentPath();
                if (path) {
                    callback(path);
                }
            }
        }, 500);
        window.addEventListener('scroll', listener);
        return () => window.removeEventListener('scroll', listener);
    }, [callback]);
}

function getCurrentPath() {
    const root = window.document.getElementById('booq-root');
    const current = root && getCurrent(root);
    return current
        ? pathFromId(current.id)
        : undefined;
}

function getCurrent(element: Element): Element | undefined {
    if (!isPartiallyVisible(element)) {
        return undefined;
    }
    const children = element.children;
    for (let idx = 0; idx < children.length; idx++) {
        const child = children.item(idx);
        const current = child && getCurrent(child);
        if (current?.id) {
            return current;
        }
    }
    return element;
}

function isPartiallyVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    if (rect) {
        const { top, height } = rect;
        const result = height > 0 && top <= 0 && top + height >= 0;
        if (result) {
            return result;
        }
    }

    return false;
}

// --- Render

type RenderArgs = {
    booqId: string,
    parent?: BooqNode,
    withinAnchor?: boolean,
    node: BooqNode,
    path: BooqPath,
    range: BooqRange,
};
function renderNode(args: RenderArgs): ReactNode {
    const { name, content } = args.node;
    if (!name) {
        switch (args.parent?.name) {
            case 'table': case 'tbody': case 'tr':
                return null;
            default:
                return content ?? null;
        }
    } else if (name === 'img') {
        // TODO: support images
        return null;
    } else {
        const actualName = name === 'a' && args.withinAnchor
            ? 'span' // Do not nest anchors
            : name;
        return createElement(
            actualName,
            getProps(args),
            getChildren(args),
        );
    }
}

function getProps({ node, path, booqId, range }: RenderArgs) {
    return {
        ...node.attrs,
        id: pathToId(path),
        style: node.style,
        key: pathToString(path),
        href: node.ref
            ? hrefForPath(node.ref, booqId, range)
            : node.attrs?.href,
    };
}

function hrefForPath(path: BooqPath, booqId: string, range: BooqRange): string {
    if (pathInRange(path, range)) {
        return `#${pathToId(path)}`;
    } else {
        return booqHref(booqId, path);
    }
}

function getChildren({ node, path, range, booqId }: RenderArgs) {
    const withinAnchor = node.name === 'a';
    const offset = node.offset ?? 0;
    return node.children?.length
        ? node.children.map(
            (n, idx) => renderNode({
                node: n,
                path: [...path, idx + offset],
                parent: node,
                withinAnchor,
                range,
                booqId,
            })
        )
        : null;
}
