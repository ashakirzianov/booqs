import React, { createElement, ReactNode } from 'react';
import {
    BooqNode, BooqPath, pathToString, useSettings, BooqData,
    pathToId, BooqRange, pathInRange,
} from '../app';
import { bookFont } from 'controls/theme';
import { booqHref } from 'controls/Links';

export function BooqContent({ booq }: {
    booq: BooqData,
}) {
    const { fontScale } = useSettings();
    const nodes = booq.fragment.nodes;
    const range: BooqRange = {
        start: booq.fragment.current.path,
        end: booq.fragment.next?.path,
    };
    const path = [range.start[0]];
    return <div className='container'>
        <Nodes
            booqId={booq.id}
            nodes={nodes}
            path={path}
            range={range}
        />
        <style jsx>{`
            .container {
                font-family: ${bookFont};
                font-size: ${fontScale}%;
            }
            `}</style>
    </div>;
}

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
