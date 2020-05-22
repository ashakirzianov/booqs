import React, { createElement, ReactNode } from 'react';
import { BooqNode, BooqPath, pathToString } from '../app';

export function BooqContent({ nodes }: {
    nodes: BooqNode[],
}) {
    return <div>
        {
            nodes.map(
                (node, idx) => renderNode({ node, path: [idx] }),
            )
        }
    </div>;
}

type RenderArgs = {
    node: BooqNode,
    path: BooqPath,
};
function renderNode(args: RenderArgs): ReactNode {
    const { name, id, content } = args.node;
    if (!name) {
        return content ?? null;
    } else {
        const element = createElement(
            name,
            getProps(args),
            getChildren(args),
        );
        if (id) {
            const anchor = createElement('a', { id, key: id });
            return [anchor, element];
        } else {
            return element;
        }
    }
}

function getProps({ node, path }: RenderArgs) {
    return {
        ...node.attrs,
        id: `path:${pathToString(path)}`,
        style: node.style,
        key: pathToString(path),
    };
}

function getChildren({ node, path }: RenderArgs) {
    return node.children?.length
        ? node.children.map(
            (n, idx) => renderNode({ node: n, path: [...path, idx] })
        )
        : null;
}
