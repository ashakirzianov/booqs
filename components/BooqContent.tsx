import React, { createElement, ReactNode } from 'react';
import { BooqNode, BooqPath, pathToString, useSettings, Booq } from '../app';
import { bookFont } from 'controls/theme';

export function BooqContent({ booq }: {
    booq: Booq,
}) {
    const { fontScale } = useSettings();
    const nodes = booq.fragment.nodes;
    return <div className='container'>
        <Nodes nodes={nodes} />
        <style jsx>{`
            .container {
                font-family: ${bookFont};
                font-size: ${fontScale}%;
            }
            `}</style>
    </div>;
}

function Nodes({ nodes }: {
    nodes: BooqNode[],
}) {
    return <>
        {
            nodes.map(
                (node, idx) => renderNode({ node, path: [idx] }),
            )
        }
    </>;
}

type RenderArgs = {
    parent?: BooqNode,
    withinAnchor?: boolean,
    node: BooqNode,
    path: BooqPath,
};
function renderNode(args: RenderArgs): ReactNode {
    const { name, id, content } = args.node;
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
        const element = createElement(
            actualName,
            getProps(args),
            getChildren(args),
        );
        if (id) {
            const anchor = createElement(
                args.withinAnchor ? 'span' : 'a', // Do not nest anchors
                { id, key: id },
            );
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
    const withinAnchor = node.name === 'a';
    return node.children?.length
        ? node.children.map(
            (n, idx) => renderNode({
                node: n,
                path: [...path, idx],
                parent: node,
                withinAnchor,
            })
        )
        : null;
}
